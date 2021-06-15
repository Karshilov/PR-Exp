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

n = NCA(2)
n.fit(X, Y)
print (n.A)