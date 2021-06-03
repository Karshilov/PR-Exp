import { train, valid } from './data'
/// <reference types="echarts" />

type KDTNode = {
    val: Array<number> | [0, 0, 0, 0];
    d: number | -1;
    divider: number | -1;
    l: KDTNode | null;
    r: KDTNode | null;
    fg: boolean | false;
}

type pair = {
    val: number;
    node: KDTNode;
}

const chooseDimension = (nodes: Array<KDTNode>) => {
    const sum: Array<number> = [0, 0, 0, 0];
    const cube: Array<number> = [0, 0, 0, 0];
    nodes.forEach((node) => {
        for (let i = 0; i < 4; i++) {
            sum[i] += node.val[i];
        }
    })
    for (let i = 0; i < 4; i++) sum[i] /= nodes.length;
    nodes.forEach((node) => {
        for (let i = 0; i < 4; i++) {
            cube[i] += (node.val[i] - sum[i]) * (node.val[i] - sum[i]);
        }
    })
    const cubeMax = Math.max(Math.max(cube[0], cube[1]), Math.max(cube[2], cube[3]));
    if (Math.abs(cubeMax - cube[0]) < 1e-14) return 0;
    if (Math.abs(cubeMax - cube[1]) < 1e-14) return 1;
    if (Math.abs(cubeMax - cube[2]) < 1e-14) return 2;
    return 3;
};

const balanceKDT = (nodes: Array<KDTNode>): KDTNode => {
    const dimension = chooseDimension(nodes)
    if (nodes.length === 1) {
        return {
            d: dimension,
            divider: nodes[0].val[dimension],
            l: null,
            r: null,
            val: nodes[0].val,
            fg: nodes[0].fg
        };
    }
    nodes.sort((a, b) => {
        return (a.val[dimension] < b.val[dimension] ? -1 : 1)
    })
    const divp = Math.floor((nodes.length / 2 + 0.5));
    return {
        d: dimension,
        divider: nodes[divp].val[dimension],
        l: divp > 0 ? balanceKDT(nodes.slice(0, divp)) : null,
        r: divp + 1 < nodes.length ? balanceKDT(nodes.slice(divp + 1, nodes.length)) : null,
        val: nodes[divp].val,
        fg: nodes[divp].fg
    }
};

const EuclidMetric = (x: KDTNode, y: KDTNode): number => {
    return Math.sqrt(Math.pow(x.val[0] - y.val[0], 2) + Math.pow(x.val[1] - y.val[1], 2) + Math.pow(x.val[2] - y.val[2], 2) + Math.pow(x.val[3] - y.val[3], 2));
};

const ChebyshevMetric = (x: KDTNode, y: KDTNode): number => {
    return Math.max(Math.max(Math.abs(x.val[0] - y.val[0]), Math.abs(x.val[1] - y.val[2])),
        Math.max(Math.abs(x.val[2] - y.val[2]), Math.abs(x.val[3] - y.val[3])));
};

const ManhattanMetric = (x: KDTNode, y: KDTNode): number => {
    return Math.abs(x.val[0] - y.val[0]) + Math.abs(x.val[1] - y.val[2]) + Math.abs(x.val[2] - y.val[2]) + Math.abs(x.val[3] - y.val[3]);
};

const calcDistance = (idx: number, x: KDTNode, y: KDTNode): number => {
    if (idx == 0) return EuclidMetric(x, y);
    if (idx == 1) return ChebyshevMetric(x, y);
    if (idx == 2) return ManhattanMetric(x, y);
    return 0;
};

const calculateResult = (K: number, metric: number, valid: Array<KDTNode>, rt: KDTNode): number => {
    const nearest: Array<pair> = [];
    const KNNSearch = (trg: KDTNode, metricIndex: number, root: KDTNode | null) => {
        if (root === null || root.d == -1) return;
        if (trg.val[root.d] < root.divider) KNNSearch(trg, metricIndex, root.l);
        else KNNSearch(trg, metricIndex, root.r);
        nearest.push({
            val: calcDistance(metricIndex, trg, root),
            node: root,
        });
        nearest.sort((a: pair, b: pair) => {
            return a.val < b.val ? -1 : 1;
        })
        while (nearest.length > K) nearest.pop();
        const radius = nearest[nearest.length - 1].val;
        if (radius > Math.abs(trg.val[root.d] - root.divider)) {
            if (trg.val[root.d] < root.divider) KNNSearch(trg, metricIndex, root.r);
            else KNNSearch(trg, metricIndex, root.l);
        }
    };
    let cnt = 0;
    valid.forEach((dot) => {
        nearest.length = 0;
        KNNSearch(dot, metric, rt);
        let cnt1 = 0;
        nearest.forEach((x) => {
            if (x.node.fg) cnt1++;
        })
        if ((cnt1 > K - cnt1) === dot.fg) cnt++;
    })
    return cnt / valid.length;
}

function main() {
    const trainNodes: Array<KDTNode> = []; 
    const norm: Array<number> = [-0x3f3f3f3f, -0x3f3f3f3f, -0x3f3f3f3f, -0x3f3f3f3f];
    for (let i = 0; i < train.length; i += 5) {
        trainNodes.push({
            val: [train[i], train[i + 1], train[i + 2], train[i + 3]],
            fg: (!!train[i + 4]),
            d: -1,
            divider: -1,
            l: null,
            r: null,
        })
        norm[0] = Math.max(norm[0], train[i]);
        norm[1] = Math.max(norm[1], train[i + 1]);
        norm[2] = Math.max(norm[1], train[i + 2]);
        norm[3] = Math.max(norm[1], train[i + 3]);
    }
    const validNodes: Array<KDTNode> = [];
    for (let i = 0; i < valid.length; i += 5) {
        validNodes.push({
            val: [valid[i], valid[i + 1], valid[i + 2], valid[i + 3]],
            fg: (!!valid[i + 4]),
            d: -1,
            divider: -1,
            l: null,
            r: null,
        })
        norm[0] = Math.max(norm[0], valid[i]);
        norm[1] = Math.max(norm[1], valid[i + 1]);
        norm[2] = Math.max(norm[1], valid[i + 2]);
        norm[3] = Math.max(norm[1], valid[i + 3]);
    }
    const root = balanceKDT(trainNodes.map((e) => {
        return {
            val: [e.val[0] / norm[0] * 100, e.val[1] / norm[1] * 100, e.val[2] / norm[2] * 100, e.val[3] / norm[3] * 100],
            fg: e.fg,
            d: e.d,
            divider: e.divider,
            l: e.l,
            r: e.r
        }
    }))
    const normedValid = validNodes.map(e => {
        return {
            val: [e.val[0] / norm[0] * 100, e.val[1] / norm[1] * 100, e.val[2] / norm[2] * 100, e.val[3] / norm[3] * 100],
            fg: e.fg,
            d: e.d,
            divider: e.divider,
            l: e.l,
            r: e.r
        }
    })
    const eulerData: Array<number> = [];
    const chebData: Array<number> = [];
    const manData: Array<number> = [];
    const kData: Array<number> = [];
    for (let i = 1; i < 50; i += 2) {
        kData.push(i);
        eulerData.push(calculateResult(i, 0, normedValid, root));
        chebData.push(calculateResult(i, 1, normedValid, root));
        manData.push(calculateResult(i, 2, normedValid, root));
    }
    const rdiv = document.getElementById('root')!;
    rdiv.innerHTML = "";
    rdiv.style.width = '600px';
    rdiv.style.height = '480px';
    const chart = echarts.init(rdiv);
    const option = {
        title: {
            text: 'KNN - 常规距离度量实验'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['欧式距离', '切比雪夫距离', '曼哈顿距离']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            data: kData.map((e) => e.toString())
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '欧式距离',
                type: 'line',
                smooth: true,
                data: eulerData
            },
            {
                name: '切比雪夫距离',
                type: 'line',
                smooth: true,
                data: chebData
            },
            {
                name: '曼哈顿距离',
                type: 'line',
                smooth: true,
                data: manData
            },
        ]
    };
    chart.setOption(option);
}

main();

//g++ -lstdc++ KDT.cpp Read.cpp -o KDT --std=c++14