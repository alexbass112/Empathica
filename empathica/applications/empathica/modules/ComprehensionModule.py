import re
import nlp
from string import lower

class ResponseData:
    def __init__(self):
        self.concepts = []
        self.variables = {}

class CcaComprehensionModule:
    
    def __init__(self,file):
        self.var_finder = re.compile(r'\$[A-Z]*')
        self.numdict = {}
        self.numdict['one'] = 1
        self.numdict['two'] = 2
        self.numdict['three'] = 3
        self.numdict['four'] = 4
        self.numdict['five'] = 5
        self.numdict['six'] = 6
        self.numdict['seven'] = 7
        self.yeslist = []
        self.yeslist.append('yes')
        self.yeslist.append('yeah')
        self.yeslist.append('yup')
        self.nolist = []
        self.nolist.append('no')
        self.nolist.append('nope')
        self.nolist.append('nah')
        self.poslist = []
        self.poslist.append('positive')
        self.poslist.append('together')
        self.neglist = []
        self.neglist.append('negative')
        self.neglist.append('conflict')
        self.samelist = []
        self.samelist.append('same')
        self.oppositelist = []
        self.oppositelist.append('opposite')

    def understand(self,s_prototype,s_tags,grammars,text):
        if s_prototype == 'RATE':
            return self.comprehend_rating(s_tags)
        elif s_prototype == 'YESNO':
            return self.comprehend_yesno(s_tags)
        elif s_prototype == 'CONTYPE':
            return self.comprehend_connection(s_tags)
        else:
            return self.comprehend_other(grammars,s_tags,text)  
            
    def comprehend_rating(self,s_tags):
        ret = ResponseData()
        nums_found = []
        for (text,tag) in s_tags:
            if lower(text) in self.numdict:
                nums_found.append(self.numdict[lower(text)])
            elif tag == 'CD' or tag == 'LS':
                try:
                    nums_found.append(int(text))
                except ValueError:
                    pass
        #This first case handles issues like "I'd say it's between 4 and 5."
        if len(nums_found) == 2:
            ret.variables['RATE'] = sum(nums_found)/2
            return ret
        elif len(nums_found) == 1:
            ret.variables['RATE'] = nums_found[0]
            return ret
        else:
            ret.variables['ERROR'] = True
            return ret

    def comprehend_yesno(self,s_tags):
        ret = ResponseData()
        yesfound = False
        nofound = False
        for (text,tag) in s_tags:
            if lower(text) in self.yeslist:
                yesfound = True
            elif lower(text) in self.nolist:
                nofound = True
        if yesfound and nofound:
            ret.variables['ERROR'] = True
            return ret
        elif yesfound:
            ret.variables['YESNO'] = True
            return ret
        elif nofound:
            ret.variables['YESNO'] = False
            return ret
        else:
            ret.variables['ERROR'] = True
            return ret

    def comprehend_connection(self,s_tags):
        ret = ResponseData()
        posfound = False
        negfound = False
        samefound = False
        oppositefound = False
        numfound = 0
        for (text,tag) in s_tags:
            if lower(text) in self.poslist:
                if not posfound:
                    numfound += 1
                posfound = True
            if lower(text) in self.neglist:
                if not negfound:
                    numfound += 1
                negfound = True
            if lower(text) in self.samelist:
                if not samefound:
                    numfound += 1
                samefound = True
            if lower(text) in self.oppositelist:
                if not oppositefound:
                    numfound += 1
                oppositefound = True
        if numfound > 1:
            ret.variables['ERROR'] = True
            return ret
        elif posfound:
            ret.variables['CONTYPE'] = 1
            return ret
        elif negfound:
            ret.variables['CONTYPE'] = -1
            return ret
        elif samefound:
            ret.variables['MERGETYPE'] = 1
            return ret
        elif oppositefound:
            ret.variables['MERGETYPE'] = -1
            return ret
        else:
            ret.variables['ERROR'] = True
            return ret
    
    def comprehend_other(self,grammars,s_tags,text):
        ret = ResponseData()
        for grammar in grammars:
            for i in range(len(s_tags)):
                match = True
                #Todo: KMP this shit
                for j in range(len(grammar.pos_tags)):
                    if i + j >= len(s_tags):
                        match = False
                        break
                    
                    if s_tags[i+j][1] != grammar.pos_tags[j]:
                        match = False
                        break
                if match:
                    name = ''
                    for j in range(len(grammar.pos_tags)):
                        name += s_tags[i+j][0] + ' '
                    if grammar.name == 'CONCEPT':
                        ret.concepts.append((name.strip(),''))
                    else:
                        ret.variables[grammar.name] = name.strip()
        if grammars == []:
            if text.strip() != '':
                new_c = nlp.get_concepts(text)
                for c in new_c:
                    ret.concepts.append((c,''))
                
        return ret
    
    def devariable(self,s_val,var_map,args):
        acnt = 0
        mvars = 1
        while mvars != None:
            mvars = self.var_finder.search(s_val)
            if mvars and s_val:
                if s_val[mvars.span()[0] + 1:mvars.span()[1]] == 'CONCEPT':
                    s_val = s_val[:mvars.span()[0]] + args[acnt] + s_val[mvars.span()[1]:] #KILL
                    acnt = acnt + 1
                elif var_map:
                    if s_val[mvars.span()[0] + 1:mvars.span()[1]] in var_map: #KILL
                        repval = var_map[s_val[mvars.span()[0] + 1:mvars.span()[1]]]
                        s_val = s_val[:mvars.span()[0]] + repval + s_val[mvars.span()[1]:]
        return s_val
        
