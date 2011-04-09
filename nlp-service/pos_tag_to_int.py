

pos_tags = ['$', '\'\'', '(', ')', ',', '--', '.', ':', 'CC', 'CD', 'DT', 'EX', 'FW', 'IN', 'JJ', 'JJR', 'JJS', 'LS', 'MD', 'NN',
'NNP', 'NNPS', 'NNS', 'PDT', 'POS', 'PRP', 'PRP$', 'NAME', 'RB', 'RBR', 'RBS', 'RP', 'SYM', 'TO', 'UH', 'VB', 
'VBD', 'VBG', 'VBN', 'VBP', 'VBZ', 'WDT', 'WP', 'WP$', 'WRB', '``']

def get_pos_tag(tag):
    if not tag in pos_tags:
        return -1
    return pos_tags.index(tag)