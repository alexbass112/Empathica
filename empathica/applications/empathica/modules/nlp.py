import logging
import urllib
import urllib2
import gluon.contrib.simplejson
from gluon.settings import settings

if settings.web2py_runtime_gae:
    from google.appengine.api import urlfetch

def is_name(word):
    word_json = urllib2.urlopen('http://50.17.251.11/is_name', urllib.urlencode({'word' : word}))
    result = gluon.contrib.simplejson.loads(word_json.read())
    return result['is_name']

def pos_tag(pos_input):
    if pos_input is None or pos_input.strip() == '':
        return ''
    tagged_input = urllib2.urlopen('http://50.17.251.11/postag', urllib.urlencode({'input' : pos_input}))
    result = gluon.contrib.simplejson.loads(tagged_input.read())
    return result

def get_concepts(text_input):
    if text_input is None or text_input.strip() == '':
        return ''
    concepts = urllib2.urlopen('http://50.17.251.11/concepts', urllib.urlencode({'input' : text_input}))
    result = gluon.contrib.simplejson.loads(concepts.read())
    for i in range(len(result)):
        result[i] = urllib.unquote(result[i])
    return result