#include <iostream>
#include <cstdio>
#include <cmath>
#include <cstdlib>
#include <cctype>
#include <algorithm>
#include <vector>
#include <map>
#include <set>
#include <deque>
#include <queue>
#include "Read.h"
#define LL long long
using namespace std;

struct Node {
    double val[4];
    int d, divider, l, r;
    bool fg;
    Node () { val[0] = val[1] = val[2] = val[3] = 0; d = divider = l = r = -1; fg = false; }
    bool operator < (const Node& x) const {
        return x.divider < divider;
    }
};

#define Ls(x) x << 1
#define Rs(x) x << 1 | 1
#define DEBUG_H cout << "before" << endl
#define DEBUG_T cout << "after" << endl

typedef pair<int, Node> pin;

const int MAXN = 100100;
const double INF = 1e50;

Node kdt[MAXN];

vector<Node> dataHandler(string train_file_name) {
    Read train_data = Read(train_file_name);
    const vector<vector<string> > raw = train_data.dataSet;
    vector<vector<int> > data = vector<vector<int> >(raw.size(), vector<int>());
    for (int i = 0; i < raw.size(); i++) {
        const auto line = raw[i];
        for (int j = 0; j < 5; j++) {
            data[i].push_back(atoi(line[j].c_str()));
        }
    }
    vector<Node> dots = vector<Node>();
    for (auto line : data) {
        Node x;
        for (int i = 0; i < 4; i++) {
            x.val[i] = line[i];
        }
        if (line[4]) x.fg = true;
        else x.fg = false;
        dots.push_back(x);
    }
    return dots;
}

signed main() {
    const string train_file_name = "./train_data.csv";
    auto dots = dataHandler(train_file_name);
    const string valid_file_name = "./val_data.csv";
    auto valid = dataHandler(valid_file_name);
    vector<double> normalization = vector<double>(4, 0);
    for (int i = 0; i < 4; i++) {
        double e = -INF;
        for (auto dot : dots) {
            e = max(dot.val[i], e);
        }
        for (auto dot : valid) {
            e = max(dot.val[i], e);
        }
        normalization[i] = e;
    }
    for (int i = 0; i < 4; i++) {
        for (auto &dot : dots) {
            dot.val[i] *= 100;
            dot.val[i] /= normalization[i];
            
        }
        for (auto &dot : valid) {
            dot.val[i] *= 100;
            dot.val[i] /= normalization[i];
            
        }
    }
    const auto chooseDimension = [&](vector<Node> nodes)->int {
        double sum[4] = {0, 0, 0, 0};
        double cube[4] = {0, 0, 0, 0};
        for (auto node : nodes) {
            for (int i = 0; i < 4; i++) {
                sum[i] += node.val[i];
            }
        }
        for (int i = 0; i < 4; i++) sum[i] /= nodes.size();
        for (auto node : nodes) {
            for (int i = 0; i < 4; i++) {
                cube[i] += (node.val[i] - sum[i]) * (node.val[i] - sum[i]);
            }
        }
        const auto cubeMax = max(max(cube[0], cube[1]), max(cube[2], cube[3]));
        if (fabs(cubeMax - cube[0]) < 1e-14) return 0;
        if (fabs(cubeMax - cube[1]) < 1e-14) return 1;
        if (fabs(cubeMax - cube[2]) < 1e-14) return 2;
        return 3;
    };
    int root = 1;
    const auto balanceKDT = [&](auto && self, vector<Node> nodes, int x)->void {
        const int dim = chooseDimension(nodes);
        const auto cmp = [&](const Node& a, const Node& b) {
            return a.val[dim] < b.val[dim];
        };
        const int divp = nodes.size() >> 1;
        if (nodes.size() > 1) nth_element(nodes.begin(), nodes.begin() + divp, nodes.end(), cmp);
        const Node midNode = nodes.size() > 1 ? nodes[divp] : nodes[0];
        kdt[x] = nodes[divp];
        kdt[x].d = dim, kdt[x].divider = kdt[x].val[dim];
        if (nodes.size() > 1) {
            self(self, vector<Node>(nodes.begin(), nodes.begin() + divp), Ls(x));
            self(self, vector<Node>(nodes.begin() + divp, nodes.end()), Rs(x));
        }
    };
    balanceKDT(balanceKDT, dots, 1);
    const auto EuclidMetric = [](Node x, Node y)->double {
        return sqrt(pow(x.val[0] - y.val[0], 2) + pow(x.val[1] - y.val[1], 2) + pow(x.val[2] - y.val[2], 2) + pow(x.val[3] - y.val[3], 2));
    };
    const auto ChebyshevMetric = [](Node x, Node y)->double {
        return max(max(fabs(x.val[0] - y.val[0]), fabs(x.val[1] - y.val[2])), max(fabs(x.val[2] - y.val[2]), fabs(x.val[3] - y.val[3])));
    };
    const auto ManhattanMetric = [](Node x, Node y)->double {
        return fabs(x.val[0] - y.val[0]) + fabs(x.val[1] - y.val[2]) + fabs(x.val[2] - y.val[2]) + fabs(x.val[3] - y.val[3]);
    };
    const auto calcDistance = [&](int idx, Node x, Node y)->double {
        if (idx == 0) return EuclidMetric(x, y);
        if (idx == 1) return ChebyshevMetric(x, y);
        if (idx == 2) return ManhattanMetric(x, y);
        return 0;
    };
    set<pin> nearest = set<pin>();
    int K, mtcIndex;
    cin >> K >> mtcIndex;
    const auto KNNSearch = [&](auto && self, Node trg, int x, int metricIndex)->void {
        const auto root = kdt[x];
        if (root.d == -1) return;
        if (trg.val[root.d] < root.divider)
            self(self, trg, Ls(x), metricIndex);
        else
            self(self, trg, Rs(x), metricIndex);
        nearest.insert(make_pair(calcDistance(metricIndex, trg, root), root));
        while (nearest.size() > K) {
            set<pin>::iterator it;
            for (it = nearest.begin(); it != nearest.end(); it++);
            it--;
            nearest.erase(it);
        }
        set<pin>::iterator it;
        for (it = nearest.begin(); it != nearest.end(); it++);
        it--;
        const double radius = (*it).first;
        if (radius > fabs(trg.val[root.d] - root.divider)) {
            if (trg.val[root.d] < root.divider)
                self(self, trg, Rs(x), metricIndex);
            else
                self(self, trg, Ls(x), metricIndex);
        }
    };
    double res = 0;
    int cnt = 0;
    for (auto dot: valid) {
        nearest.clear();
        KNNSearch(KNNSearch, dot, 1, mtcIndex);
        int cnt1 = 0;
        for (auto x : nearest) {
            if (x.second.fg) cnt1++;  
        }
        if ((cnt1 > K - cnt1) == dot.fg) cnt++;
    }
    res = (double) cnt * 1.0 / (double) valid.size();
    cout << res << endl;
    return 0;
}

//g++ -lstdc++ KDT.cpp Read.cpp -o KDT --std=c++14