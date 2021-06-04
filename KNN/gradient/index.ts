import { train } from './data'

const vectorSqare = (x: number[]) => {
    let ret = 0;
    x.forEach((e) => {
        ret += e * e;
    })
    return ret;
}

(() => {
    const rdiv = document.getElementById('root')!
    rdiv.innerHTML = "";
    rdiv.style.width = '800px';
    rdiv.style.height = '640px';
    // var chart = echarts.init(rdiv);
    const A = [[0, 0, 0, 0], [0, 0, 0, 0]]
    const raw: Array<Array<number> > = [];
    const Y: Array<number> = [];
    const norm: Array<number> = [-0x3f3f3f3f, -0x3f3f3f3f, -0x3f3f3f3f, -0x3f3f3f3f];
    for (let i = 0; i < train.length; i += 5) {
        raw.push([train[i], train[i + 1], train[i + 2], train[i + 3]]);
        Y.push(train[i + 4]);
        norm[0] = Math.max(norm[0], train[i]);
        norm[1] = Math.max(norm[1], train[i + 1]);
        norm[2] = Math.max(norm[1], train[i + 2]);
        norm[3] = Math.max(norm[1], train[i + 3]);
    }
    const X = raw.map((item) => {
        return item.map((e, index) => {
            return e / norm[index];
        })
    })
    const Xd: number[][] = [];
    for (let i = 0; i < X.length; i++) {
        for (let j = 0; j < X.length; j++) {
            const tmp: number[] = []
            for (let k = 0; k < 4; k++) {
                tmp[k] = X[i][k] - X[j][k];
            }
            Xd[i][j] = vectorSqare(tmp);
        }
    }
    const gradientDescent = () => {
        
    }
})()