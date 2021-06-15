import numpy as np
import json

class NCA():
    def __init__(self, var_dims, learning_rate = 0.01, max_steps = 100, init_style = "normal", init_stddev = 0.1):
        self.var_dims = var_dims
        self.learning_rate = learning_rate
        self.max_steps = max_steps
        self.init_style = init_style
        self.init_stddev = init_stddev

    def fit(self, X, Y):
        (n, d) = X.shape
        self.n_samples = n
        self.param_dims = d
        self.A = self.get_random_params(shape = (self.param_dims, self.var_dims))

        s = 0
        target = 0
        res = []
        while s < self.max_steps:
            if s >= 1:
                res.append(target)
            if s % 2 == 0 and s > 1:
                print("Step {}, target = {}...".format(s, target))
            low_X = np.dot(X, self.A)
            sum_row = np.sum(low_X ** 2, axis = 1)
            xxt = np.dot(low_X, low_X.transpose())
            #broadcast
            dist_mat = sum_row + np.reshape(sum_row, (-1, 1)) - 2 * xxt

            exp_neg_dist = np.exp(-dist_mat)
            exp_neg_dist = exp_neg_dist - np.diag(np.diag(exp_neg_dist))
            prob_mat = exp_neg_dist / np.sum(exp_neg_dist, axis = 1).reshape((-1, 1))

            # calc p
            prob_row = np.array([np.sum(prob_mat[i][Y == Y[i]]) for i in range(self.n_samples)])
            target = np.sum(prob_row)

            gradients = np.zeros((self.param_dims, self.param_dims))
            for i in range(self.n_samples):
                k_sum = np.zeros((self.param_dims, self.param_dims))
                k_same_sum = np.zeros((self.param_dims, self.param_dims))
                # for k
                for k in range(self.n_samples):
                    out_prod = np.outer(X[i] - X[k], X[i] - X[k])
                    k_sum += prob_mat[i][k] * out_prod
                    if Y[k] == Y[i]:
                        k_same_sum += prob_mat[i][k] * out_prod
                gradients += prob_row[i] * k_sum - k_same_sum
            gradients = 2 * np.dot(gradients, self.A)
            self.A += self.learning_rate * gradients
            s += 1
        result = json.dumps({ 'result': res })
        f = open('fA_' + str(self.learning_rate), 'w+')
        f.write(result)
        f.close()

    def transform(self, X):
        low_X = np.dot(X, self.A)
        return low_X


    def fit_transform(self, X, Y):
        self.fit(X, Y)
        low_X = self.transform(X)
        return low_X

    def get_random_params(self, shape):
        if self.init_style == "normal":
            return self.init_stddev * np.random.standard_normal(size = shape)
        elif self.init_style == "uniform":
            return np.random.uniform(size = shape)
        else:
            print("No such parameter init style!")
            raise Exception