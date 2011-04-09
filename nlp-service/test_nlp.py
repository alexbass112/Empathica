from nlp_nn import NaturalLanguageNetwork
import nltk

nln = NaturalLanguageNetwork(r'C:\users\iforneri\Documents\tr_res.txt')
nln.parse_and_train()
#nln.print_validation()
print nln.get_concepts(nltk.pos_tag(nltk.word_tokenize('My friend always wets the bed.')))
print nln.get_concepts(nltk.pos_tag(nltk.word_tokenize('It smells awful and it makes me ill.')))
print nln.get_concepts(nltk.pos_tag(nltk.word_tokenize('I have to clean the sheets and it takes a long time.')))