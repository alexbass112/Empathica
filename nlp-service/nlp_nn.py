from pybrain.datasets import SupervisedDataSet
from pybrain.tools.shortcuts import buildNetwork
from pybrain.supervised.trainers import BackpropTrainer
from pybrain.utilities import percentError
from pybrain.structure.modules import SoftmaxLayer


pos_tags = ['$', '\'\'', '(', ')', ',', '--', '.', ':', 'CC', 'CD', 'DT', 'EX', 'FW', 'IN', 'JJ', 'JJR', 'JJS', 'LS', 'MD', 'NN',
'NNP', 'NNPS', 'NNS', 'PDT', 'POS', 'PRP', 'PRP$', 'NAME', 'RB', 'RBR', 'RBS', 'RP', 'SYM', 'TO', 'UH', 'VB', 
'VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'WDT', 'WP', 'WP$', 'WRB', '``']

def get_pos_tag(tag):
    if not tag in pos_tags:
        return -1
    return float(pos_tags.index(tag))/float(len(pos_tags))
    
    
class NaturalLanguageNetwork:
    def __init__(self,file):
        self.file = file
        self.ios = 30
        self.hns = 25
        self.epochs = 300
        self.ds = SupervisedDataSet(self.ios,self.ios)
        self.nn = None
    
    def get_concepts(self,inp_pos):
        inp = []
        ret = []
        for (word,pos) in inp_pos:
            inp.append(get_pos_tag(pos))
        inp = self.pad(inp,self.ios,-1)
        res = self.nn.activate(inp)
        print res
        cur_str = ''
        for i in range(len(res)):
            if round(res[i]) == 1:
                print 'Matched a node'
                if i < len(inp_pos):
                    print 'Appending ' + str(inp_pos[i][0])
                    cur_str += inp_pos[i][0] + ' '
            elif cur_str != '':
                ret.append(cur_str.strip())
                cur_str = ''
        return ret       
    
    def parse_and_train(self):
        f = open(self.file,'r')
        learn_lines = []
        for line in f:
            if line.strip() != '':
                learn_lines.append(line)
        i = 0
        f.close()
        while i < len(learn_lines):
            ins, outs = self.convert_to_tuple(learn_lines[i],learn_lines[i+1])
            i += 2
            self.ds.addSample(ins,outs)
        self.nn = buildNetwork(self.ios,self.hns,self.ios)
        self.train_dat, self.test_dat = self.ds.splitWithProportion(0.75)
        trnr = BackpropTrainer(self.nn,dataset=self.train_dat,momentum=0.1,verbose=False,weightdecay=0.01)
        i = 150
        trnr.trainEpochs(150)
        while i < self.epochs:
            trnr.trainEpochs(50)
            i += 50
            print 'For epoch ' + str(i)
            print 'For train:'
            self.print_current_error()
            print 'For test:'
            self.print_validation()
        self.nn.sortModules()
        #trnr.trainEpochs(self.epochs)
        #trnr.trainUntilConvergence()
        #for i in range(self.epochs):
        #    trnr.trainEpochs(1)
        
    def print_validation(self):
        res = self.nn.activateOnDataset(self.test_dat)
        ttl_misses = 0
        for i in range(len(res)):
            resul = []
            for v in res[i]:
                resul.append(round(v))
            print 'Misses: ' + str(self.num_misses(resul,self.test_dat['target'][i]))
            ttl_misses += self.num_misses(resul,self.test_dat['target'][i])
        print 'Average Misses: ' + str(float(ttl_misses)/float(len(self.test_dat['target'])))

    def print_current_error(self):
        res = self.nn.activateOnDataset(self.train_dat)
        ttl_misses = 0
        for i in range(len(res)):
            resul = []
            for v in res[i]:
                resul.append(round(v))
            #print 'Misses: ' + str(self.num_misses(resul,self.train_dat['target'][i]))
            ttl_misses += self.num_misses(resul,self.train_dat['target'][i])
        print 'Average Misses: ' + str(float(ttl_misses)/float(len(self.train_dat['target'])))
        
    def num_misses(self,first,second):
        num = 0
        for i in range(len(first)):
            if first[i] != 1 and second[i] == 1:
                num += 1
            elif first[i] == 1 and second[i] != 1:
                num += 1
        return num
    
    def convert_to_tuple(self,poses,incls):
        #I'm chopping off the last thing here because the strings being parsed 
        #are ; terminated, resulting in an empty entry
        pos_list = poses.split(';')[:-1]
        incl_list = incls.split(';')[:-1]
        pos_vals = []
        incl_vals = []
        for p in pos_list:
            pos_vals.append(get_pos_tag(p))
        for i in incl_list:
            incl_vals.append(int(i))
        pos_vals = self.pad(pos_vals,self.ios,-1)
        incl_vals = self.pad(incl_vals,self.ios,0)
        return (tuple(pos_vals), tuple(incl_vals))
        
        
    def pad(self,ls,sz,pd_val):
        while len(ls) < sz:
            ls.append(pd_val)
        return ls
        