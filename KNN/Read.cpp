#include"Read.h"
#include <fstream>  
#include <sstream>  
#include <iostream> 
#include <vector> 
using namespace std;

Read::Read(string filename) {
	ifstream inFile(filename);
	string linestr;
	//�ж�
	if (inFile.fail()) {
		cout << "��ȡ�ļ�ʧ��" << endl;
	}
	vector<string>temp(5);//���ڴ洢��ȡ����ÿ������
	dataHead = vector<string>(5);
	dataSet.resize(1000, temp);//���������С
	int row, column;
	row = 0;
	while (getline(inFile, linestr)) {
		column = 0;
		stringstream ss(linestr);//��ɶ�ά��ṹ
		string str;//ÿ���еĵ����ַ�

		while (getline(ss, str, ',')) {
			// cout << column << " " << row << endl;
			if (row == 0) {
				dataHead[column] = str.c_str();
			}
			else {
				dataSet[row-1][column] = str.c_str();//atof���ַ���תΪdouble����
			}
			column++;
		}
		row++;
	}
	vector<string>resizeData(column);
	dataSet.resize(row-1, resizeData);
}