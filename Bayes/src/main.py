import os
import sys
import math
import numpy as np
import pandas as pd
sys.path.append(os.getcwd())

pdata = pd.read_csv(os.getcwd() + '/Bayes/data/train_data.csv', header=None)
test_data = pd.read_csv(os.getcwd() + '/Bayes/data/test_data.csv', header=None)

npdata = pd.DataFrame(pdata).values
final_test = pd.DataFrame(test_data).values

def get_params(data):
    X = data[:, 1:]

    mu = X.sum(axis=0) / len(X)
    X -= mu
    delta=np.sum(X ** 2, axis=0) / len(X)

    return mu, delta

w1 = np.array(list(filter(lambda x: x[0] == 1, npdata)))
w2 = np.array(list(filter(lambda x: x[0] == 2, npdata)))
w3 = np.array(list(filter(lambda x: x[0] == 3, npdata)))

super_p1 = len(w1) / len(npdata)
super_p2 = len(w2) / len(npdata)
super_p3 = len(w3) / len(npdata)

def calc_prob(x, mu, delta):
    f = []
    for row in x:
        base = 1
        for i in range(len(row)):
            base *= (1 / math.sqrt(2 * math.pi * delta[i]) * math.exp(-(row[i] - mu[i]) ** 2 / (2 * delta[i])))
        f.append(base)
    f = np.array(f)
    return f
a, b = get_params(w1)
x_prob1 = calc_prob(final_test[:, 1:], a, b) * super_p1

a, b = get_params(w2)
x_prob2 = calc_prob(final_test[:, 1:], a, b) * super_p2

a, b = get_params(w3)
x_prob3 = calc_prob(final_test[:, 1:], a, b) * super_p3

cnt = 0
for i in range(len(x_prob3)):
    if x_prob1[i] == max(x_prob1[i], x_prob2[i], x_prob3[i]):
        if final_test[i][0] == 1:
            cnt = cnt + 1
            continue
    if x_prob2[i] == max(x_prob1[i], x_prob2[i], x_prob3[i]):
        if final_test[i][0] == 2:
            cnt = cnt + 1
            continue
    if x_prob3[i] == max(x_prob1[i], x_prob2[i], x_prob3[i]):
        if final_test[i][0] == 3:
            cnt = cnt + 1
            continue

print (cnt / len(final_test))

