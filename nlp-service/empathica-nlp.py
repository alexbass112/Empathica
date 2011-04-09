#!/usr/bin/env python
#
# Copyright 2011 James Kendle
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import logging
import nltk
import urllib
from nltk.corpus import names
from nltk.corpus import wordnet
from nlp_nn import NaturalLanguageNetwork

from tornado.options import define, options

define("port", default=8000, help="run on the given port", type=int)

nln = NaturalLanguageNetwork(r'./tr_res.txt')

def is_name(word):
        for fileid in names.fileids():
                for name in names.words(fileid):
                        if name == word:
                                return True
        return False

class IsNameHandler(tornado.web.RequestHandler):
    def post(self):
        word = urllib.unquote(self.get_argument('word'))
        logging.info('IS_NAME: Got %s as input', word)
        result = is_name(word)

        message = {
                'word' : word,
                'is_name' : result,
        }
        self.write(tornado.escape.json_encode(message))

class PartOfSpeechHandler(tornado.web.RequestHandler):
    def post(self):
        logging.info(self.get_argument('input'))
        input = urllib.unquote(self.get_argument('input'))
        logging.info('TOKENIZE: Got %s as input', input)
        tokens = nltk.word_tokenize(input)
        tags = nltk.pos_tag(tokens)
        tagged_input = []
        for(token, tag) in tags:
                if(is_name(token)):
                        tagged_input.append((token, 'NAME'))
                else:
                        tagged_input.append((token, tag))
        self.write(tornado.escape.json_encode(tagged_input))

class ConceptHandler(tornado.web.RequestHandler):
    def post(self):
        logging.info(self.get_argument('input'))
        input = urllib.unquote(self.get_argument('input'))
        logging.info('CONCEPT: Got %s as input', input)
        tokens = nltk.word_tokenize(input)
        tags = nltk.pos_tag(tokens)
        tagged_input = []
        for(token, tag) in tags:
                if(is_name(token)):
                        tagged_input.append((token, 'NAME'))
                else:
                        tagged_input.append((token, tag))
        concepts = nln.get_concepts(tagged_input)
        self.write(tornado.escape.json_encode(concepts))
        
def main():
    tornado.options.parse_command_line()
    nln.parse_and_train()
    application = tornado.web.Application([
        (r"/is_name", IsNameHandler),
        (r"/postag", PartOfSpeechHandler),
        (r"/concepts", ConceptHandler),
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()

