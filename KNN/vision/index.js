"use strict";
exports.__esModule = true;
var data_1 = require("./data");
var chooseDimension = function (nodes) {
    var sum = [0, 0, 0, 0];
    var cube = [0, 0, 0, 0];
    nodes.forEach(function (node) {
        for (var i = 0; i < 4; i++) {
            sum[i] += node.val[i];
        }
    });
    for (var i = 0; i < 4; i++)
        sum[i] /= nodes.length;
    nodes.forEach(function (node) {
        for (var i = 0; i < 4; i++) {
            cube[i] += (node.val[i] - sum[i]) * (node.val[i] - sum[i]);
        }
    });
    var cubeMax = Math.max(Math.max(cube[0], cube[1]), Math.max(cube[2], cube[3]));
    if (Math.abs(cubeMax - cube[0]) < 1e-14)
        return 0;
    if (Math.abs(cubeMax - cube[1]) < 1e-14)
        return 1;
    if (Math.abs(cubeMax - cube[2]) < 1e-14)
        return 2;
    return 3;
};
var balanceKDT = function (nodes) {
    var dimension = chooseDimension(nodes);
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
    nodes.sort(function (a, b) {
        return (a.val[dimension] < b.val[dimension] ? -1 : 1);
    });
    var divp = Math.floor((nodes.length / 2 + 0.5));
    return {
        d: dimension,
        divider: nodes[divp].val[dimension],
        l: divp > 0 ? balanceKDT(nodes.slice(0, divp)) : null,
        r: divp + 1 < nodes.length ? balanceKDT(nodes.slice(divp + 1, nodes.length)) : null,
        val: nodes[divp].val,
        fg: nodes[divp].fg
    };
};
var EuclidMetric = function (x, y) {
    return Math.sqrt(Math.pow(x.val[0] - y.val[0], 2) + Math.pow(x.val[1] - y.val[1], 2) + Math.pow(x.val[2] - y.val[2], 2) + Math.pow(x.val[3] - y.val[3], 2));
};
var ChebyshevMetric = function (x, y) {
    return Math.max(Math.max(Math.abs(x.val[0] - y.val[0]), Math.abs(x.val[1] - y.val[1])), Math.max(Math.abs(x.val[2] - y.val[2]), Math.abs(x.val[3] - y.val[3])));
};
var ManhattanMetric = function (x, y) {
    return Math.abs(x.val[0] - y.val[0]) + Math.abs(x.val[1] - y.val[1]) + Math.abs(x.val[2] - y.val[2]) + Math.abs(x.val[3] - y.val[3]);
};
var calcDistance = function (idx, x, y) {
    if (idx == 0)
        return EuclidMetric(x, y);
    if (idx == 1)
        return ChebyshevMetric(x, y);
    if (idx == 2)
        return ManhattanMetric(x, y);
    return 0;
};
var calculateResult = function (K, metric, valid, rt) {
    var nearest = [];
    var KNNSearch = function (trg, metricIndex, root) {
        if (root === null || root.d == -1)
            return;
        if (trg.val[root.d] < root.divider)
            KNNSearch(trg, metricIndex, root.l);
        else
            KNNSearch(trg, metricIndex, root.r);
        nearest.push({
            val: calcDistance(metricIndex, trg, root),
            node: root
        });
        nearest.sort(function (a, b) {
            return a.val < b.val ? -1 : 1;
        });
        while (nearest.length > K)
            nearest.pop();
        var radius = nearest[nearest.length - 1].val;
        if (radius > Math.abs(trg.val[root.d] - root.divider)) {
            if (trg.val[root.d] < root.divider)
                KNNSearch(trg, metricIndex, root.r);
            else
                KNNSearch(trg, metricIndex, root.l);
        }
    };
    var cnt = 0;
    valid.forEach(function (dot) {
        nearest.length = 0;
        KNNSearch(dot, metric, rt);
        var cnt1 = 0;
        nearest.forEach(function (x) {
            if (x.node.fg)
                cnt1++;
        });
        if ((cnt1 > K - cnt1) === dot.fg)
            cnt++;
    });
    return cnt / valid.length;
};
function main() {
    var trainNodes = [];
    var norm = [-0x3f3f3f3f, -0x3f3f3f3f, -0x3f3f3f3f, -0x3f3f3f3f];
    for (var i = 0; i < data_1.train.length; i += 5) {
        trainNodes.push({
            val: [data_1.train[i], data_1.train[i + 1], data_1.train[i + 2], data_1.train[i + 3]],
            fg: (!!data_1.train[i + 4]),
            d: -1,
            divider: -1,
            l: null,
            r: null
        });
        norm[0] = Math.max(norm[0], data_1.train[i]);
        norm[1] = Math.max(norm[1], data_1.train[i + 1]);
        norm[2] = Math.max(norm[1], data_1.train[i + 2]);
        norm[3] = Math.max(norm[1], data_1.train[i + 3]);
    }
    var validNodes = [];
    for (var i = 0; i < data_1.valid.length; i += 5) {
        validNodes.push({
            val: [data_1.valid[i], data_1.valid[i + 1], data_1.valid[i + 2], data_1.valid[i + 3]],
            fg: (!!data_1.valid[i + 4]),
            d: -1,
            divider: -1,
            l: null,
            r: null
        });
        norm[0] = Math.max(norm[0], data_1.valid[i]);
        norm[1] = Math.max(norm[1], data_1.valid[i + 1]);
        norm[2] = Math.max(norm[1], data_1.valid[i + 2]);
        norm[3] = Math.max(norm[1], data_1.valid[i + 3]);
    }
    var root = balanceKDT(trainNodes.map(function (e) {
        return {
            val: [e.val[0] / norm[0] * 100, e.val[1] / norm[1] * 100, e.val[2] / norm[2] * 100, e.val[3] / norm[3] * 100],
            fg: e.fg,
            d: e.d,
            divider: e.divider,
            l: e.l,
            r: e.r
        };
    }));
    var normedValid = validNodes.map(function (e) {
        return {
            val: [e.val[0] / norm[0] * 100, e.val[1] / norm[1] * 100, e.val[2] / norm[2] * 100, e.val[3] / norm[3] * 100],
            fg: e.fg,
            d: e.d,
            divider: e.divider,
            l: e.l,
            r: e.r
        };
    });
    var eulerData = [];
    var chebData = [];
    var manData = [];
    var kData = [];
    for (var i = 1; i < 60; i += 2) {
        kData.push(i);
        eulerData.push(calculateResult(i, 0, normedValid, root));
        chebData.push(calculateResult(i, 1, normedValid, root));
        manData.push(calculateResult(i, 2, normedValid, root));
    }
    var rdiv = document.getElementById('root');
    rdiv.innerHTML = "";
    rdiv.style.width = '800px';
    rdiv.style.height = '640px';
    var chart = echarts.init(rdiv);
    var option = {
        title: {
            text: 'KNN - 常规距离度量实验'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['欧式距离', '切比雪夫距离', '曼哈顿距离'],
            top: '25px'
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
            name: 'K',
            type: 'category',
            data: kData.map(function (e) { return e.toString(); })
        },
        yAxis: {
            name: 'Acc',
            type: 'value',
            scale: true,
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
