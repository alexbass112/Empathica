import nltk
import sys

def process_line(word_tags):
    ret = []
    in_conc = 0
    for (word,tag) in word_tags:
        if word == '{':
            in_conc += 1
            continue
        elif word == '}':
            in_conc -= 1
            continue
        else:
            if in_conc > 0:
                ret.append((word,tag,1))
            else:
                ret.append((word,tag,0))
    return ret
    
def main(argv=None):
    if argv == None:
        argv = sys.argv
    ofile = open(argv[2],'w')
    ifile = open(argv[1],'r')
    
    for line in ifile:
        #line = ifile.readline()
        print line
        dat = process_line(nltk.pos_tag(nltk.word_tokenize(line)))
        tags = ''
        incl = ''
        for (word,tag,inc) in dat:
            tags  += str(tag) + ';'
            incl += str(inc) + ';'
        ofile.write(tags + '\n' + incl + '\n')
    ofile.close()
    ifile.close()
        

if __name__ == "__main__":
    main()