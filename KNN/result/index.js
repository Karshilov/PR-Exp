"use strict";
exports.__esModule = true;
const { writeToPath } = require('@fast-csv/format');
const path = require('path');

var data_1 = require("./data");

var mA = [[[-9.51319315, -3.70999657],
    [ 5.34647591,  1.94004661],
    [ 5.40323919,  2.2097934 ],
    [-4.09802851, -1.5853339 ]], 
    [[-13.2769628 ,   2.26589917],
    [  7.13929039,  -1.30932483],
    [  7.23142405,  -1.1449546 ],
    [ -5.48900428,   0.93730463]], 
    [[14.55476797,  4.29953489],
    [-8.34884013, -2.4260628 ],
    [-8.6085355 , -2.59014461],
    [ 6.32093491,  1.86922563]], 
    [[-11.43359921,  11.94483366],
    [  6.92464117,  -7.31728861],
    [  7.09774365,  -7.33271237],
    [ -5.30081329,   5.53801765]], 
    [[ 17.16375817,   4.8365984 ],
    [-10.73442903,  -3.0004986 ],
    [-10.70582114,  -3.04216962],
    [  8.21135046,   2.31419557]], 
    [[ -0.74415787, -19.06582242],
    [  0.50057286,  11.93082426],
    [  0.43528759,  12.0441108 ],
    [ -0.36215288,  -9.27781106]], 
    [[  2.74643691, -20.05408925],
    [ -1.55408994,  12.63270742],
    [ -1.907861  ,  12.64634691],
    [  1.35133189,  -9.867361  ]], 
    [[ 21.2805831 ,  -0.96819175],
    [-13.47158529,   0.55155781],
    [-13.38744827,   0.67038069],
    [ 10.56278191,  -0.48055102]], 
    [[ 7.40067828e-02,  2.22905211e+01],
    [ 5.11305280e-03, -1.40396143e+01],
    [-9.86564385e-02, -1.41313871e+01],
    [ 3.70398014e-02,  1.11548475e+01]], 
    [[  9.46188414,  21.31490905],
    [ -5.9642674 , -13.43081901],
    [ -6.01965343, -13.56550901],
    [  4.77972137,  10.76733816]]];
var _global_A = 0;

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
var NCAMetric = function (x, y) {
    var dis = []
    for (let i = 0; i < 4; i++) dis.push(x.val[i] - y.val[i]);
    var hlf = [0, 0]
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 2; j++) {
            hlf[j] += dis[i] * mA[_global_A][i][j] * 100;
        }
    }
    return Math.sqrt(hlf[0] * hlf[0] + hlf[1] * hlf[1]);
}
var calcDistance = function (idx, x, y) {
    if (idx == 0)
        return EuclidMetric(x, y);
    if (idx == 1)
        return ChebyshevMetric(x, y);
    if (idx == 2)
        return ManhattanMetric(x, y);
    if (idx == 3)
        return NCAMetric(x, y);
    return 0;
};
var calculateResult = function (K, metric, test, rt) {
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
    var resArray = [];
    test.forEach(function (dot) {
        nearest.length = 0;
        KNNSearch(dot, metric, rt);
        var cnt1 = 0;
        nearest.forEach(function (x) {
            if (x.node.fg)
                cnt1++;
        });
        resArray.push((cnt1 > K - cnt1))
    });
    return resArray.map(item => [item ? 1 : 0]);
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
    var testNodes = [];
    for (var i = 0; i < data_1.test.length; i += 4) {
        testNodes.push({
            val: [data_1.test[i], data_1.test[i + 1], data_1.test[i + 2], data_1.test[i + 3]],
            fg: 0,
            d: -1,
            divider: -1,
            l: null,
            r: null
        });
        norm[0] = Math.max(norm[0], data_1.test[i]);
        norm[1] = Math.max(norm[1], data_1.test[i + 1]);
        norm[2] = Math.max(norm[1], data_1.test[i + 2]);
        norm[3] = Math.max(norm[1], data_1.test[i + 3]);
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
    var normedtest = testNodes.map(function (e) {
        return {
            val: [e.val[0] / norm[0] * 100, e.val[1] / norm[1] * 100, e.val[2] / norm[2] * 100, e.val[3] / norm[3] * 100],
            fg: e.fg,
            d: e.d,
            divider: e.divider,
            l: e.l,
            r: e.r
        };
    });
    const euc = calculateResult(1, 1, normedtest, root);
    _global_A = 5;
    const mt = calculateResult(1, 3, normedtest, root);
    writeToPath(path.resolve(__dirname, 'euc.csv'), euc)
    .on('error', err => console.error(err))
    .on('finish', () => console.log('Done writing.'));
    writeToPath(path.resolve(__dirname, 'mt.csv'), mt)
    .on('error', err => console.error(err))
    .on('finish', () => console.log('Done writing.'));
}
main();
