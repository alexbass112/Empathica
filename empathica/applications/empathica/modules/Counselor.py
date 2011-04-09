from OutputProvider import CcaOutputProvider
from ComprehensionModule import CcaComprehensionModule
from ComprehensionModule import ResponseData
from OutputProvider import ReplyQueryPair
from GraphComprehension import GraphComprehender
import nlp
import random
import os

class Grammar:
    def __init__(self):
        self.pos_tags = []
        self.multiplicities = []
        self.name = ''

class CounselorConversationalAgent :
    
    def __init__(self):
        self.op_cca = CcaOutputProvider(None)
        self.cm_cca = CcaComprehensionModule(None)
        self.gc = GraphComprehender()

    def parse(self,input,archetype,grammars):
        if input.strip() != '':
            s_tags = nlp.pos_tag(input)
        else:
            s_tags = []
        return self.cm_cca.understand(archetype,s_tags,grammars,input)#ResponseData
    
    def raw_parse(self,input):
        return nlp.pos_tag(input)
    
    def get_response(self,expectation):
        return self.op_cca.getNextResponse(expectation)
    
    def generate_connection(self,first,second):
        #first and second are tuples of name,defn
        return self.ipm_cca.related(first[1],second[1])
        #TODO: take more into account than just definition
    
    def select_next_query(self,concepts,adjacency_matrix,negative_adjacency,definitions):
        imp = self.gc.generate_importance(concepts,adjacency_matrix)
        sparse = self.gc.generate_sparseness(concepts,adjacency_matrix)
        conprobs = self.gc.connection_probability(concepts,adjacency_matrix, negative_adjacency, definitions)
        best_arch = 'More'
        best_val = 0.2
        best_node_1 = -1
        best_node_2 = -1
        for conc in concepts:
            if concepts[conc] == None:
                val = self.gc.kr * self.gc.bias('Rate',conc,concepts,imp,sparse)
                if val > best_val:
                    best_arch = 'Rate'
                    best_val = val
                    best_node_1 = conc
                    best_node_2 = -1
            val = self.gc.kn * self.gc.bias('OTHER',conc,concepts,imp,sparse)
            if val > best_val:
                best_arch = 'MoreAbout'
                best_val = val
                best_node_1 = conc
                best_node_2 = -1
            for conc2 in concepts:
                if conc != conc2 and not (conc2 in adjacency_matrix[conc]) and not (conc2 in negative_adjacency[conc]):
                    val = conprobs[conc][conc2] * self.gc.bias('Connect',conc,concepts,imp,sparse)
                    if val > best_val:
                        best_arch = 'Connect'
                        best_val = val
                        best_node_1 = conc
                        best_node_2 = conc2
        return (best_arch,best_node_1,best_node_2)
        '''
        deprecated: use the one that takes a qry
    def get_query(self,archetype,var_map,args):
        #Returns a tuple of text,archetype
        qry = self.op_cca.getNextQuery(archetype)
        return (self.cm_cca.devariable(qry.query,var_map,args),qry.reply_archetype)
        '''
    def get_query(self,query,var_map,args):
        return self.cm_cca.devariable(query,var_map,args)
    def get_preamble(self):
        return self.op_cca.get_preamble()
        
