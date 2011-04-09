"""
CAM Documentation
"""
import logging
import urllib
import random
from datetime import datetime

import gluon.contrib.simplejson

if settings.web2py_runtime_gae:
    from google.appengine.api import channel
    from google.appengine.api import memcache
    from google.appengine.api import taskqueue

@auth.requires_login()
def counsellor():
    """
    DO DOCUMENTATION
    """
    map_id = request.args(0)
    cam = {}
    if(auth.has_permission('read', db.Map, map_id)):
        cam = db.Map[map_id]
        conflict = cam.id_group.id_conflict
        response.title = "Counsellor - " + conflict.title
        return dict(cam=cam, conflict = conflict)
    else:
        raise HTTP(400);

@auth.requires_login()
def edit():
    """
    TODO
    """
    map_id = request.args(0)
    if(auth.has_permission('read', db.Map, map_id)):
        cam = db.Map[map_id]
        group = db.GroupPerspective[cam.id_group]
        conflict = db.Conflict[group.id_conflict]
        response.title = "Edit - " + conflict.title
        client_id = str(random.random())
        channel_token = 'invalid'
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % cam.id)
            if not maplisteners:
                maplisteners = []
                memcache.set('map_%s_listeners' % cam.id, maplisteners)
            channel_token = channel.create_channel(client_id)
            if client_id not in maplisteners:
                maplisteners.append(client_id)
                memcache.set('map_%s_listeners' % cam.id, maplisteners)
        return dict(channel_token = channel_token, cam = cam, conflictid = conflict.id, conflict=conflict)
    else:
        raise HTTP(400)

@service.json
def get_suggestions(map_id):
    """
    TODO
    """
    if(auth.has_permission('read', db.Map, map_id)):
        suggestions = [] 

        cam = db.Map(map_id)
        conflict = cam.id_group.id_conflict
        groups = db(db.GroupPerspective.id_conflict == conflict.id).select()

        maps = []
        for g in groups:
            map = db(db.Map.id_group == g.id).select()
            maps.extend(map)
        
        for m in maps:
            if m.id != cam.id:
                nodes = db(db.Node.id_map == m.id).select()
                for n in nodes:
                    suggestions.append((n.id, n.name))
        return dict(success=True, suggestions=suggestions[0:3])
    else:
        return dict(success=False)

@service.json
def ignore_suggestion(map_id, id):
    """
    TODO
    """
    # Check perimssion on suggestion listy wherever that is
    if(auth.has_permission('update', db.Map, map_id)):
        # DIRTY BITTTTTT
        return dict(success=True)
    else:
        return dict(success=False)
        
@auth.requires_login()
def review():
    """
    TODO
    """
    response.title = "Review" # include actual title
    return dict()

@auth.requires_login()
def call():
    """
    TODO
    """
    session.forget()
    return service()

# Counsellor

def counselor_config():
    db.ChatGrammars.insert(grammar_name='INTRO',pos_list='NAME',variable_name='USRNAME')
    db.ChatGrammars.insert(grammar_name='RATE',pos_list='CD',variable_name='RATE')
    db.ChatGrammars.insert(grammar_name='YESNO',pos_list='YESNO',variable_name='YESNO')
    
    '''
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='NNZ',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='VB',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='VBZ',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='NNP',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='VBD',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='NNS',variable_name='CONCEPT')
    
    
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBZ;RB*;NNP',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBZ;VBG',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBZ;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBZ;NNP',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBP;DT;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;RB*;VBD',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='DT;NN;VBZ;JJ',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBZ;DT;NN;NN;IN;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='DT;NNS;DT;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBP;TO;VB;JJ*;NNS',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;RB*;VBZ;RP;RB',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='NNS;IN;CD;NNS',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP$;NN;CC;PRP;VBP;RB*;VB;IN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBP;JJ*;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBP;JJ',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP$;NN;NNS;CC*;NNS*;IN;DT;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;MD;VB;PRP;IN;PRP$;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBZ;PRP$;NNS',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBZ;PRP$;NN',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='NAME;VBZ;RB;IN;PRP',variable_name='CONCEPT')
    db.ChatGrammars.insert(grammar_name='GRMR',pos_list='PRP;VBP;RP;IN;DT;NN',variable_name='CONCEPT')
    '''

    db.ChatResponses.insert(expectation=1,response='I see, that makes sense.')
    db.ChatResponses.insert(expectation=1,response='That\'s what I thought.')
    db.ChatResponses.insert(expectation=1,response='I expected as much.')
    db.ChatResponses.insert(expectation=2,response='I\'ll make a note of that.')
    db.ChatResponses.insert(expectation=2,response='That\'s good to know.')
    db.ChatResponses.insert(expectation=2,response='I understand.')
    db.ChatResponses.insert(expectation=3,response='Really? Okay.')
    db.ChatResponses.insert(expectation=3,response='That\'s not what I expected.')
    db.ChatResponses.insert(expectation=3,response='Interesting. Understood.')

    db.ChatQuestions.insert(question='On a scale from 1 to 7, 1 being strongly dislike and 7 being strongly like, how do you feel about $CONCEPT?',reply='RATE',query='Rate')
    db.ChatQuestions.insert(question='How do you feel about $CONCEPT on a scale between 1 and 7, 1 being strongly dislike and 7 being strong like?',reply='RATE',query='Rate')
    db.ChatQuestions.insert(question='Would you say $CONCEPT is related to $CONCEPT?',reply='YESNO',query='Connect')
    db.ChatQuestions.insert(question='So is there a connection between $CONCEPT and $CONCEPT?',reply='YESNO',query='Connect')
    db.ChatQuestions.insert(question='Would you say that the connection is positive and the two things go together or negative and they conflict? They could also be the same, or opposite of one another.',reply='CONTYPE',query='ConnectType')
    db.ChatQuestions.insert(question='Would you say that $CONCEPT and $CONCEPT go together, conflict with one another, are the same, or are opposites?',reply='CONTYPE',query='ConnectType')
    db.ChatQuestions.insert(question='Could you elaborate a little further?',reply='GRMR',query='More')
    db.ChatQuestions.insert(question='Please tell me a little more.',reply='GRMR',query='More')
    db.ChatQuestions.insert(question='Go on.',reply='GRMR',query='More')
    db.ChatQuestions.insert(question='Could you tell me a bit more, $USRNAME?',reply='GRMR',query='More')
    db.ChatQuestions.insert(question='Could you tell me more about $CONCEPT?',reply='GRMR',query='MoreAbout')
    db.ChatQuestions.insert(question='Tell me more about how $CONCEPT fits into this.',reply='GRMR',query='MoreAbout')
    db.ChatQuestions.insert(question='Please tell me more about $CONCEPT, $USRNAME.',reply='GRMR',query='MoreAbout')
    db.ChatQuestions.insert(question='So, $USRNAME, tell me about the problem.',reply='GRMR',query='Start')
    db.ChatQuestions.insert(question='Okay, $USRNAME. Why don\'t you tell me about the situation?',reply='GRMR',query='Start')

    return dict()
   
@auth.requires_login()
def talk():
    """
    TODO
    """
    map_id = request.args(0)
    user_text = request.vars.message
    response = ""

    Counselor = local_import('Counselor')
    cca = Counselor.CounselorConversationalAgent()

    #Check if we have a conversation and create it if we don't
    convo = db(db.ChatSession.id_map == map_id).select().first()
    if not convo:
        db.ChatSession.insert(expected_archetype='INTRO',id_map=map_id)
        response += cca.get_preamble()
        response = response.replace('\n','<br />')
        jsEval="$('.counsellor .msg-body').append('%s<br />').append('%s<br />');" % ('You: ' + user_text.replace('\'', '&apos;'), response)
        return response
    else:
        '''
        Load data from the database into usable data structures
        '''
        adjacency_matrix = {}
        negative_adjacency = {}
        for node in db(db.Node.id_map == map_id and db.Node.visible).select():
            adjacency_matrix[node.id] = {}
            negative_adjacency[node.id] = []
            for edge in db(db.Connection.id_first_node == node.id).select():
                if edge.valence != 0:
                    adjacency_matrix[node.id][edge.id_second_node] = edge.valence
                else:
                    negative_adjacency[node.id].append(edge.id_second_node)
            for edge in db(db.Connection.id_second_node == node.id).select():
                if edge.valence != 0:
                    adjacency_matrix[node.id][edge.id_first_node] = edge.valence
                else:
                    negative_adjacency[node.id].append(edge.id_first_node)
        nodes = {}
        defns = {}
        for node in db(db.Node.id_map == map_id).select():
            nodes[node.id] = node.valence
            defns[node.id] = node.name
            
        '''
        Parse the input and load the acquired data into the database
        '''
            
        #Find out what kind of text we were expecting and then parse it
        arch = db(db.ChatSession.id_map == map_id).select().first().expected_archetype
        
        db_grammars = db(db.ChatGrammars.grammar_name==arch).select()
        grammars = []
        if db_grammars != None and len(db_grammars) != 0:
            for gr in db_grammars:
                new_gr = Counselor.Grammar()
                poses = gr.pos_list.rsplit(';')
                for p in poses:
                    if p.find('*') != -1:
                        new_gr.multiplicities.append('*')
                    else:
                        new_gr.multiplicities.append('1')
                    new_gr.pos_tags.append(p.replace('*',''))
                new_gr.name = gr.variable_name
                grammars.append(new_gr)
        
        logging.info('for parsing got: ' + urllib.quote(user_text))
       
        data = cca.parse(urllib.quote(user_text),arch,grammars)
        
        if 'ERROR' in data.variables and data.variables['ERROR']:
            response += 'Huh? Sorry, I didn\'t quite understand what you said.'
            arch = 'NONE'
        else:
            grmr_raw = cca.raw_parse(urllib.quote(user_text))
            grmr_str = urllib.quote(user_text)
            grmr_pos = ''
            for (text,tag) in grmr_raw:
                grmr_pos += tag + ";"
            db.GrammarLogs.insert(raw_text=grmr_str,pos_tags=grmr_pos)
            
            responses = db(db.ChatResponses.expectation==2).select()
            i = random.randint(0,len(responses) - 1)
            
            needs_name = False
            if arch == 'INTRO':
                needs_name = True
        
            arch = 'NONE'
            
            for var in data.variables:
                if var == 'RATE':
                    rate_var = db(db.ChatSession.id_map == map_id).select().first().rate_variable
                    if rate_var:
                        query = (db.Node.id == rate_var)
                        new_valence = (float(int(data.variables[var])) - 4.0)/ 3.0
                        db(query).update(valence=new_valence)
                        nodes[rate_var] = new_valence
                elif var == 'YESNO':
                    if data.variables[var]:
                        arch = 'ConnectType'
                    else:
                        #insert an empty connection and clear the old variables
                        conone = db(db.ChatSession.id_map == map_id).select().first().connect_one
                        contwo = db(db.ChatSession.id_map == map_id).select().first().connect_two
                        db.Connection.insert(id_first_node=conone,id_second_node=contwo,valence=0)
                        query = (db.ChatSession.id_map == map_id)
                        db(query).update(connect_one=None)
                        db(query).update(connect_two=None)
                        negative_adjacency[conone].append(contwo)
                        negative_adjacency[contwo].append(conone)
                elif var == 'CONTYPE':
                    conone = db(db.ChatSession.id_map == map_id).select().first().connect_one
                    contwo = db(db.ChatSession.id_map == map_id).select().first().connect_two
                    db.Connection.insert(id_first_node=conone,id_second_node=contwo,id_map=map_id,valence=data.variables[var])
                    adjacency_matrix[conone][contwo] = data.variables[var]
                    adjacency_matrix[contwo][conone] = data.variables[var]
                elif var == 'MERGETYPE':
                    conone = db(db.ChatSession.id_map == map_id).select().first().connect_one
                    contwo = db(db.ChatSession.id_map == map_id).select().first().connect_two
                    #TODO: replace this line with better code, should use more than just cardinality to pick winner
                    if len(adjacency_matrix[contwo]) > len(adjacency_matrix[conone]):
                        conone, contwo = contwo, conone
                        
                    if data.variables[var] == 1:
                        #if the nodes are the same
                        sub_list = db(db.Node.id==conone).select().first().subsumes
                        if sub_list == None:
                            sub_list = []
                        sub_list.append(contwo)
                        db(db.Node.id==conone).update(subsumes=sub_list)
                    elif data.variables[var] == -1:
                        #the nodes are opposite
                        opp_list = db(db.Node.id==conone).select().first().opposite
                        if opp_list == None:
                            opp_list = []
                        opp_list.append(contwo)
                        db(db.Node.id==conone).update(opposite=opp_list)
                    db(db.Node.id==contwo).update(visible=False)
                    del nodes[contwo]
                    for adj_rm in adjacency_matrix[contwo]:
                        if contwo in adjacency_matrix[adj_rm]:
                            del adjacency_matrix[adj_rm][contwo]
                    del adjacency_matrix[contwo]
                else:
                    if var == 'USRNAME':
                        #Adding a special case for when we just got a user name.
                        arch = 'Start'
                        needs_name = False
                    db.ChatVariables.insert(id_map=map_id,variable=var,value=data.variables[var])
            
            if needs_name:
                uid = db(db.Map.id==map_id).select().first().id_group
                uname = db(db.GroupPerspective.id==uid).select().first().name
                db.ChatVariables.insert(id_map=map_id,variable='USRNAME',value=uname)
                arch = 'Start'
            #Store concepts in data model
        
            for new_concept in data.concepts:
                query = (db.Node.id_map == map_id)
                exists = False
                for concept in db(query).select():
                    if concept.name == new_concept[0]:
                        exists = True
                        break    
                if not exists:
                    id = db.Node.insert(name=new_concept[0],valence=None,id_map=map_id)
            
        '''
        Now we reason about what to ask next and load up the next question
        '''
        next_q = None
        if arch == 'NONE':
            next_q = cca.select_next_query(nodes,adjacency_matrix,negative_adjacency,defns)
            arch = next_q[0]
            if next_q[0] == 'Rate':
                db(db.ChatSession.id_map == map_id).update(rate_variable=next_q[1])
                db.commit()
            elif next_q[0] == 'Connect':
                db(db.ChatSession.id_map == map_id).update(connect_one=next_q[1])
                db(db.ChatSession.id_map == map_id).update(connect_two=next_q[2])
                db.commit()

        args = []
        if(next_q != None):
            if(next_q[1] != -1):
                args.append(defns[next_q[1]])
            if next_q[2] != -1:
                args.append(defns[next_q[2]])
        var_map = {}
        for var in db(db.ChatVariables.id_map==map_id).select():
            var_map[var.variable] = var.value
            
        #grab the query string
        qryset = db(db.ChatQuestions.query==arch).select()
        i = random.randint(0,len(qryset) - 1)
        
        qry = cca.get_query(qryset[i].question,var_map,args)
        db(db.ChatSession.id_map == map_id).update(expected_archetype=qryset[i].reply)
        response += qry

    #response = response.replace('\n', '<br />').replace('\'', '&apos;')
    return response

@service.json
def get_graph_data(map_id):
    '''
    Parse through and return all the map information
    Param: map id
    '''
    if(auth.has_permission('read', db.Map, map_id)):
        nodes = {}
        edges = {}
        theme = db.Map[map_id].theme
        for row in db(db.Connection.id_map == map_id).select():
            edges[row.id] = { 'id': row.id, 'valence': row.valence, 'inner_points': row.inner_points, 'from': row.id_first_node, 'to': row.id_second_node, 'selected': False }
        for node in db(db.Node.id_map == map_id).select():
            nodes[node.id] = { 'id': node.id, 'text': node.name, 'valence': node.valence, 'dim': { 'x': node.x, 'y': node.y, 'width' : node.width, 'height' : node.height }, 'selected': False, 'newNode': False }
        mapdata = {
                'mapid' : map_id,
                'nodes' : nodes,
                'edges' : edges,
                'theme' : theme
        }
        return dict(success=True, mapdata=mapdata)
    else:
        return dict(success=False)
        
@service.json
def add_node(map_id, token, x, y, width, height, name):
    '''
    By default set valences to 0 for new nodes
    '''
    if(auth.has_permission('update', db.Map, map_id)):
        map = db.Map(map_id)
        node_id = db.Node.insert(id_map=map_id, valence = 0, x = x, y = y, width = width, height = height, name = name)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email, is_empty = False)

        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                node = {    'id': node_id, 
                            'text': name, 
                            'valence': 0, 
                            'dim': 
                                { 
                                    'x': float(x), 
                                    'y': float(y), 
                                    'width' : float(width), 
                                    'height' : float(height),
                                }, 
                            'selected': False, 
                            'newNode': False,
                        }
                message = { 'type': 'nodeadd',
                            'node': node }
                for to_id in maplisteners:
                    channel.send_message(to_id, gluon.contrib.simplejson.dumps(message))

        return dict(success=True, token=token, node_id=node_id)
    else:
        return dict(success=False, token=token)

@service.json
def add_suggested_node(map_id, other_node_id, name, x, y, width, height, valence):
    """
    TODO
    """
    if (auth.has_permission('update', db.Map, map_id)):
        node_id = db.Node.insert(id_map=map_id, valence = valence, x = x, y = y, width = width, height = height, name = name)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email, is_empty = False)
        
        # Correlate!
        target_map = int(map_id)
        source_map = db.Node(other_node_id).id_map.id
        if (target_map < source_map):
            db.NodeMapping.insert(map_one = target_map, node_one = node_id, map_two = source_map, node_two = other_node_id, identical = True)
        else:
            db.NodeMapping.insert(map_one = source_map, node_one = other_node_id, map_two = target_map, node_two = node_id, identical = True)
        
        return dict(success=True, token=other_node_id, node_id=node_id)
    else:
        return dict(success=False, token=other_node_id)
        
@service.json
def remove_node(map_id, node_id):
    """
    TODO
    """
    map_id = db.Node[node_id].id_map
    if(auth.has_permission('update', db.Map, map_id)):
        db(db.Connection.id_first_node == node_id).delete()
        db(db.Connection.id_second_node == node_id).delete()
        del db.Node[node_id]
        updated_map_info = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if db(db.Node.id_map == map_id).count() > 0:
            updated_map_info['is_empty'] = False
        else:
            updated_map_info['is_empty'] = True
        db.Map[map_id] = updated_map_info
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                message = { 'type': 'noderemove',
                            'nodeid': node_id }
                for to_id in maplisteners:
                    channel.send_message(to_id, gluon.contrib.simplejson.dumps(message))

        return dict(success=True)
    else:
        return dict(success=False)


@service.json
def rename_node(map_id, node_id, name):
    '''
    TODO
    '''
    map_id = db.Node[node_id].id_map
    if(auth.has_permission('update', db.Map, map_id)):
        db.Node[node_id] = dict(name=name)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                message = { 'type' : 'noderename',
                            'nodeid' : int(node_id),
                            'name' : str(name) }
                for to_id in maplisteners:
                    channel.send_message(to_id, gluon.contrib.simplejson.dumps(message))

        return dict(success=True, node_id = node_id)
    else:
        db.rollback()
        return dict(success=False)

@service.json
def edit_node_valence(map_id, node_id, valence):
    """
    TODO
    """
    map_id = db.Node[node_id].id_map
    if(auth.has_permission('update', db.Map, map_id)):
        db.Node[node_id] = dict(valence=valence)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                message = { 'type' : 'nodevalence',
                            'nodeid' : int(node_id),
                            'valence' : float(valence) }
                for to_id in maplisteners:
                    channel.send_message(to_id, gluon.contrib.simplejson.dumps(message))

        return dict(success=True)
    else:
        return dict(success=False)

@service.json
def edit_node_dim(map_id, node_id, x, y, width, height):
    '''
    TODO
    '''
    if(auth.has_permission('update', db.Map, map_id)):
        db.Node[node_id] = dict(x = x, y = y, width = width, height = height)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                message = { 'type' : 'nodedim',
                            'dim' : { 
                                        'x' : float(x),
                                        'y' : float(y),
                                        'width' : float(width),
                                        'height' : float(height) 
                                    }
                          }
                for to_id in maplisteners:
                    channel.send_message(to_id, "edited node dimensions")

        return dict(success=True)
    else:
        return dict(success=False)

@service.json
def create_connection(map_id, token, node_one_id, node_two_id, valence, inner_points):
    '''
    TODO
    '''
    map_one_id = db.Node[node_one_id].id_map
    map_two_id = db.Node[node_two_id].id_map

    if(map_one_id != map_two_id):
        return dict(success=False)
    
    if(auth.has_permission('update', db.Map, map_one_id) and auth.has_permission('update', db.Map, map_id)):
        connection_id = db.Connection.insert(id_first_node=node_one_id, id_second_node=node_two_id, valence=valence, inner_points=inner_points, id_map=map_id)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                for to_id in maplisteners:
                    channel.send_message(to_id, "added an edge")
        return dict(success=True, node_one=node_one_id, node_two=node_two_id, valence=valence, id=connection_id, token=token)
    else:
        return dict(success=False)

@service.json
def edit_connection_valence(map_id, edge_id, valence):
    '''
    TODO
    '''
    map_id = db.Connection[edge_id].id_map
    if(auth.has_permission('update', db.Map, map_id)):
        db.Connection[edge_id] = dict(valence=valence)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                for to_id in maplisteners:
                    channel.send_message(to_id, "edit connection valence")
        return dict(success=True)
    else:
        return dict(success=False)
        
@service.json
def edit_connection_inner_points(map_id, edge_id, inner_points):
    '''
    TODO
    '''
    map_id = db.Connection[edge_id].id_map
    if (auth.has_permission('update', db.Map, map_id)):
        db.Connection[edge_id] = dict(inner_points=inner_points)
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                for to_id in maplisteners:
                    channel.send_message(to_id, "edit connection inner points")
        return dict(success=True)
    else:
        return dict(success=False)
        
@service.json
def remove_connection(map_id, edge_id):
    """
    TODO
    """
    map_id = db.Connection[edge_id].id_map
    if(auth.has_permission('update', db.Map, map_id)):
        del db.Connection[edge_id]
        db.Map[map_id] = dict(date_modified = datetime.utcnow(), modified_by = auth.user.email)
        if settings.web2py_runtime_gae:
            maplisteners = memcache.get('map_%s_listeners' % map_id)
            if maplisteners is not None:
                for to_id in maplisteners:
                    channel.send_message(to_id, "removed connection")
        return dict(success=True)
    else:
        return dict(success=False)
        
@service.json
def set_thumbnail(map_id):
    '''
    TODO
    '''
    imgdata = request.vars.imgdata
    if(auth.has_permission('update', db.Map, map_id)):
        db.Map[map_id] = dict(thumbnail = imgdata)
        return dict(success=True)
    else:
        return dict(success=False)

@service.json
def set_png(map_id):
    '''
    TODO
    '''
    imgdata = request.vars.imgdata
    if(auth.has_permission('update', db.Map, map_id)):
        db.Map[map_id] = dict(imgdata = imgdata)
        return dict(success=True)
    else:
        return dict(success=False)

@service.json
def get_thumbnail(map_id):
    """
    TODO
    """
    if(auth.has_permission('read', db.Map, map_id)):
        import gluon.contenttype
        response.headers['Content-Type']=gluon.contenttype.contenttype('.png')
        return dict(img=db.Map[map_id].thumbnail)

@service.json
def set_theme(map_id, theme):
    '''
    Keep track of the user's selected theme
    '''
    if(auth.has_permission('update', db.Map, map_id)):
        theme = request.vars.theme
        db.Map[map_id] = dict(theme = theme)
        return dict(success=True)
    else:
        return dict(success=False)
        
@service.json
def set_show_title(map_id, show_title):
    '''
    Save whether the user wants the title of the CAM to be shown or not
    '''
    if(auth.has_permission('update', db.Map, map_id)):
        theme = request.vars.theme
        db.Map[map_id] = dict(show_title = show_title)
        return dict(success=True)
    else:
        return dict(success=False)
 
@service.json
def save_graph(map_id, data):
    '''
    params: array of data
    '''
    if(auth.has_permission('update', db.Map, map_id)):
        #todo: parse the json and save the data to the grid I guess
        return dict(success=True)
    else:
        return dict(success=False)
        
@auth.requires_login()
def download():
    map_id = request.args(0)
    if(auth.has_permission('read', db.Map, map_id)):
        cam = db.Map[map_id]
        return HTML(BODY(IMG(_src=cam.imgdata)))
    else:
        raise HTTP(400);
    