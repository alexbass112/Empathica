import math

class GraphComprehender:
    def __init__(self):
        self.kn = 0.5 # the value of asking about a node
        self.kr = 0.7 # the value of asking for a rating
        self.q_bias_reduction = 5.0
        self.i_bias_reduction = 2.0
        self.s_bias_reduction = 2.0
        self.lamda = {}
        self.alpha = {}
        self.n = {}
        #These constants were figured out experimentally.
        self.lamda['Rate'] = math.pow(0.5,16)
        self.alpha['Rate'] = 14
        self.n['Rate'] = 6
        self.lamda['Connect'] = math.pow(0.5,11)
        self.alpha['Connect'] = 14 # was 22
        self.n['Connect'] = 3
        self.lamda['OTHER'] = math.pow(0.5,6)
        self.alpha['OTHER'] = 0
        self.n['OTHER'] = 2
        
        self.lamda_close = 0.25
        self.n_close = 2.0

    def bias(self,query_type,concept,concepts,importance,sparseness):
        lamda = self.lamda[query_type]
        alpha = self.alpha[query_type]
        n = self.n[query_type]
        #q_bias is a bell curve based on the type of query
        q_bias = math.pow(math.e,(-lamda*(math.pow((abs(float(len(concepts))-alpha)),n))) / self.q_bias_reduction)
        #i_bias is an arc-tan curve that starts at -1
        i_bias = (2/math.pi)*(math.atan((float(len(concepts))/4)-3)) / self.i_bias_reduction
        #s_bias is an arc-tan curve that starts at 1
        s_bias = (0 - (2/math.pi)*(math.atan((float(len(concepts))/4)-3))) / self.s_bias_reduction
        #Okay, this line is complicated. The i_bias and s_bias are modified by the importance and sparseness respectively.
        #Then, we take the sum of these three values and average them out and then take the square root of that. This provides us with
        #a relatively smooth function that is sensitive to changes in each variable.
        return math.pow(max(0,((q_bias + (i_bias * importance[concept]) + (s_bias * sparseness[concept]))/3)),0.5)
        
        
    #concepts as a dict of id -> valence
    #adjacency_matrix as a dict of id -> dict of id-> valence
    def generate_importance(self,concepts,adjacency_matrix):
        imp = {}
        #set initial importance to the valence of the concept
        for conc in concepts:
            if concepts[conc] == None:
                imp[conc] = 0
            else:
                imp[conc] = abs(concepts[conc])
        #TODO: a dynamic programming approach for relaxing this graph should be doable in nlog(n)
        for i in range(len(concepts)):
            for conc in concepts:
                imp[conc] = self.relax(concepts,adjacency_matrix,conc,imp)
        new_imp = {}
        for conc in concepts:
            new_imp[conc] = imp[conc]
            for nbr in adjacency_matrix[conc]:
                new_imp[conc] += imp[nbr]
        imp = new_imp
        #Grab the maximum importance to normalize by
        if len(imp) == 0:
            return imp
        norm_factor = max(imp.values())
        if norm_factor  == 0:
            return imp
        for key in imp:
            imp[key] = imp[key] / norm_factor
        return imp
            
    def generate_sparseness(self,concepts,adjacency_matrix):
        sparse = {}
        for conc in concepts:
            sparse[conc] = len(adjacency_matrix[conc])
        if len(sparse) == 0:
            return sparse
        norm_factor = max(sparse.values())
        if norm_factor == 0:
            return sparse
        for conc in concepts:
            sparse[conc] = 1.0 - (float(sparse[conc]) / float(norm_factor))
        return sparse
        
    def relax(self,concepts,adjacency_matrix,id,importance):
        n_total = 0 #the total importance of all neighbours
        for conc in adjacency_matrix[id]:
            if concepts[conc] != None:
                n_total += abs(concepts[conc])
        #the math here is that the relaxed importance is the average of the importance of the node 
        #and the average importance of its neighbours
        if len(adjacency_matrix[id]) == 0:
            return importance[id]
        else:
            return (importance[id] + (n_total / len(adjacency_matrix[id]))) / 2
        
    def floyd_warshall(self,adjacency_matrix):
        apsp = {}
        for conc in adjacency_matrix:
            apsp[conc] = {}
            for nbr in adjacency_matrix[conc]:
                apsp[conc][nbr] = 1
            for conc2 in adjacency_matrix:
                if conc == conc2:
                    apsp[conc][conc2] = 0
                if not conc2 in apsp[conc]:
                    apsp[conc][conc2] = 9999
        for x in adjacency_matrix:
            for y in adjacency_matrix:
                for z in adjacency_matrix:
                    apsp[y][z] = min ( apsp[y][z], apsp[y][x] + apsp[x][z])
        return apsp
        
    #longest common subsequence algorithm
    '''
    function  LCSLength(X[1..m], Y[1..n])
    C = array(0..m, 0..n)
    for i := 0..m
       C[i,0] = 0
    for j := 0..n
       C[0,j] = 0
    for i := 1..m
        for j := 1..n
            if X[i] = Y[j]
                C[i,j] := C[i-1,j-1] + 1
            else:
                C[i,j] := max(C[i,j-1], C[i-1,j])
    return C[m,n]
    '''
    
    def text_similarity(self, string1, string2):
        substrlen = {}
        for i in range(len(string1) + 1):
            substrlen[i] = {}
        for i in range(len(string1) + 1):
            substrlen[i][0] = 0
        for j in range(len(string2) + 1):
            substrlen[0][j] = 0
        for i in range(len(string1)):
            for j in range(len(string2)):
                if string1[i] == string2[j]:
                    substrlen[i+1][j+1] = substrlen[i][j] + 1
                else:
                    substrlen[i+1][j+1] = max(substrlen[i+1][j], substrlen[i][j+1])
        return float(substrlen[len(string1)][len(string2)])/float(max(min(len(string1),len(string2)),4))
        
    def close_to(self,dist):
        return math.pow(math.e,float(-self.lamda_close*(float(math.pow(dist,self.n_close)))))

    #calculates the connection probability for all pairs of concepts
    def connection_probability(self,concepts,adjacency_matrix,negative_adjacency,definitions):
        ret = {}
        apsp = self.floyd_warshall(adjacency_matrix)
        for conc in concepts:
            ret[conc] = {}
            for conc2 in concepts:
                if conc != conc2:
                    if conc2 in negative_adjacency[conc]:
                        ret[conc][conc2] = 0
                    else:
                        ret[conc][conc2] = (self.close_to(apsp[conc][conc2]))
                        ret[conc][conc2] = (ret[conc][conc2] + self.text_similarity(definitions[conc],definitions[conc2]))
                        ret[conc][conc2] = float(math.pow(float(ret[conc][conc2]/2.0),0.5))
        return ret
    
    def graph_diff(self,conc_a,adj_a,conc_b,adj_b):
        diffconc = {}
        diffadj = {}
        if len(conc_a) != len(conc_b):
            return 'Error in diff graphs'
        for conc in conc_a:
            if not conc in conc_b:
                return 'Error in diff graphs: node sets not identical'
            diffconc[conc] = (float(conc_a[conc]) - float(conc_b[conc]))/2.0
        for conc1 in diffconc:
            for conc2 in diffconc:
                if conc1 == conc2:
                    continue
                #if an edge exists in both graphs...
                if conc2 in adj_a[conc1] and conc2 in adj_b[conc1]:
                    #only add a graph to the diff graph if there is a delta between them
                    if adj_a[conc1][conc2] != adj_b[conc1][conc2]:
                        if not conc1 in diffadj:
                            diffadj[conc1] = {}
                        diffadj[conc1][conc2] = (float(adj_a[conc1][conc2]) - float(adj_b[conc1][conc2]))/2.0
                elif conc2 in adj_a[conc1]:
                    if not conc1 in diffadj:
                        diffadj[conc1] = {}
                    diffadj[conc1][conc2] = float(adj_a[conc1][conc2]) / 2.0
                elif conc2 in adj_b[conc1]:
                    if not conc in diffadj:
                        diffadj[conc1] = {}
                    diffadj[conc1][conc2] = float(adj_b[conc1][conc2]) / 2.0
        for conc in diffconc:
            if not conc in diffadj:
                diffadj[conc] = {}
        diffimp = self.generate_importance(diffconc,diffadj)
        ret_list = []
        for k in diffimp:
            ret_list.append((diffimp[k],k))
        ret_list = sorted(ret_list)
        ret_list.reverse()
        return ret_list
    
    def calc_happiness(self, conc, assignment):
        total_hap = 0
        for c in conc:
            if c in assignment:
                if assignment[c]:
                    total_hap += conc[c]
                else:
                    total_hap -= conc[c]
        max_hap = 0
        for c in conc:
            max_hap += abs(conc[c])
        if max_hap == 0:
            return 100.0
        return (float(float(total_hap)/float(max_hap))+1)*50
    
    #concs is a dict id->valence
    #valences is a list of (valence,id) sorted by descending valence
    def gen_assignments(self,concs,valences):
        a_set = []
        base_a = {}
        
        #Start with the 'worst' assignment
        for c in concs:
            if concs[c] > 0:
                base_a[c] = False
            else:
                base_a[c] = True
        a_set.append(dict(base_a))
        for (valence,id) in valences:
            base_a[id] = not base_a[id]
            a_set.append(dict(base_a))
        return a_set
        
    def gen_valence_list(self,concs):
        v_list = []
        for c in concs:
            v_list.append((abs(concs[c]),c))
        v_list = sorted(v_list)
        v_list.reverse()
        return v_list
    
    def compromise(self, conc_a, adj_a, conc_b, adj_b):
        assignments = []
        compromises = []
        val_a = self.gen_valence_list(conc_a)
        val_b = self.gen_valence_list(conc_b)
        new_a = self.gen_assignments(conc_a,val_a)
        for a in new_a:
            if not a in assignments:
                assignments.append(a)
        new_a = self.gen_assignments(conc_b,val_b)
        for a in new_a:
            if not a in assignments:
                assignments.append(a)
        for a in assignments:
            compromises.append((self.calc_happiness(conc_a,a),self.calc_happiness(conc_b,a),a))
        compromises = sorted(compromises)
        compromises.reverse()
        p_opt_c = []
        last_a = -2
        max_b = -2
        for c in compromises:
            if c[1] > max_b:
                max_b = c[1]
                p_opt_c.append(c)
                last_a = c[0]
            elif c[1] == max_b and c[0] >= last_a:
                last_a = c[0]
                p_opt_c.append(c)
                
                
        #p_opt_c now contains the pareto optimal compromises only
        opt_delta = 200
        opt_sum = 0
        opt_node = 0
        for i in range(len(p_opt_c)):
            c = p_opt_c[i]
            if c[0] + c[1] > opt_sum:
                opt_node = i
                opt_sum = c[0] + c[1]
                opt_delta = abs(c[0] - c[1])
            elif c[0] + c[1] == opt_sum and abs(c[0] - c[1]) < opt_delta:
                opt_node = i
                opt_sum = c[0] + c[1]
                opt_delta = abs(c[0] - c[1])
        
        
        return (p_opt_c, opt_node)