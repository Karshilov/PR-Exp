import os
import sys
import numpy as np
import pandas as pd
sys.path.append(os.getcwd())
from nca import NCA

pdata = pd.read_csv(os.getcwd() + '/KNN/train_data.csv')

npdata = pd.DataFrame(pdata).values

Y = npdata[:, -1]
X = npdata[:, 0:4]
mx = np.max(X, axis=0)
X = np.array([(row / mx) for row in X])

n_3 = NCA(2, learning_rate=0.001)
n_2 = NCA(2, learning_rate=0.01)
n_1 = NCA(2, learning_rate=0.1)
n_0 = NCA(2, learning_rate=1)
n_3.fit(X, Y)
n_2.fit(X, Y)
n_1.fit(X, Y)
n_0.fit(X, Y)
print (n_3.A)
print (n_2.A)
print (n_1.A)
print (n_0.A)