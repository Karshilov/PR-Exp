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

n = NCA(2, 0.4)
n.fit(X, Y)
print (n.A)

'''
[[ -1.51077495  16.3890638 ]
 [  0.83267187  -9.99911767]
 [  1.01721511 -10.07326659]
 [ -0.69879945   7.58202371]]
'''