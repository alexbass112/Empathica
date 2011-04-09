from collections import deque
import random

class ReplyQueryPair:
	def __init__(self):
		self.query = ''
		self.reply_archetype = ''

class CcaOutputProvider:
	def __init__(self, file):
		#self.doc = etree.XML(file)
		'''
		Obsolete: use the database
	def getNextResponse(self,expect):#TODO: Split
		nodes = []
		if expect == 1:
			nodes = self.doc.xpath('//Responses[@Mode=\"Conflict\" and @Type=\"Expected\"]')
		elif expect == 2:
			nodes = self.doc.xpath('//Responses[@Mode=\"Conflict\" and @Type=\"Neutral\"]')
		elif expect == 3:
			nodes = self.doc.xpath('//Responses[@Mode=\"Conflict\" and @Type=\"Unexpected\"]')
		nodes = nodes[0]
		i = random.randint(0,len(nodes) - 1)
		return nodes[i].attrib['Text']
		'''
		'''
		Obsolete: use the database
	def getNextQuery(self,arch):
		ret = ReplyQueryPair()
		nodes = self.doc.xpath('//Queries[@Mode=\"Conflict\"]')[0]
		tmpQ = []
		for node in nodes:
			if 'Query' in node.attrib:
				if node.attrib['Query'] == arch:
					tmpQ.append(node)
		i = random.randint(0,len(tmpQ) - 1)
		node = tmpQ[i]
		ret.query = node.attrib['Text']
		ret.reply_archetype = node.attrib['Reply']
		return ret
		'''
	def get_preamble(self):
		return 'Hello. I am the Counsellor conversational agent. I am a simple bot designed to help model your emotional state with respect to a conflict. \nTo do this, I will ask you a series of questions about the issue. Please answer to the best of your ability. \nMy understanding is limited, but I will do my best. \nTo begin with, what is your name?'
