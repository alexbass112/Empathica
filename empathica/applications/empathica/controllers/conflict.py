"""
Conflict Controller
"""
import logging
from gluon.contrib import simplejson as json

if settings.web2py_runtime_gae:
    from google.appengine.api import taskqueue

@auth.requires_login()
def new():
    """
    Creates a new Conflict and associates it with two perspectives
    and 3 security groups.
    """
    response.title = "New Conflict"
    
    form = SQLFORM.factory(db.Conflict, db.GroupTempInput, table_name="NewConflict", submit_button="Create", formstyle='divs', _id="NewConflict")
    # Accessibility
    form.element(_name='title')['_tabindex'] = 1
    form.element(_name='description')['_tabindex'] = 2
    form.element(_name='name1')['_tabindex'] = 3
    form.element(_name='name2')['_tabindex'] = 4
    form.element(_name='desc1')['_tabindex'] = 5
    form.element(_name='desc2')['_tabindex'] = 6
    form.element(_type='submit')['_tabindex'] = 9
    # Javascript validators
    form.element(_name='title')['_class'] += " validate[required,maxSize[40]]"
    form.element(_name='description')['_class'] += " validate[maxSize[2000]]"
    form.element(_name='name1')['_class'] += " validate[required,maxSize[40]]"
    form.element(_name='desc1')['_class'] += " validate[maxSize[2000]]"
    form.element(_name='name2')['_class'] += " validate[required,maxSize[40]]"
    form.element(_name='desc2')['_class'] += " validate[maxSize[2000]]"

    if form.accepts(request.vars, hideerror=True): 
        cid = db.Conflict.insert(**db.Conflict._filter_fields(form.vars))
        
         # Set permissions
        adminGroupId = auth.add_group('conflict_%s_admin' % cid, 'Admin role for conflict_%s' % cid)
        auth.add_permission(adminGroupId, 'read', db.Conflict, cid)
        auth.add_permission(adminGroupId, 'update', db.Conflict, cid)
        auth.add_permission(adminGroupId, 'delete', db.Conflict, cid)
        auth.add_membership(adminGroupId)

        db.Conflict[cid] = dict(authorized_users=[auth.user.id])

        # Now create the two groups for the conflict
        group_one = db.GroupPerspective.insert(name=form.vars.name1, description=form.vars.desc1, id_conflict=cid)
        group_one_members = auth.add_group('group_%s_members' % group_one, 'Member role for group_%s' % group_one)
        group_one_admins = auth.add_group('group_%s_admins' % group_one, 'Admin role for group_%s' % group_one)
        auth.add_permission(group_one_members, 'read', db.GroupPerspective, group_one)
        auth.add_permission(group_one_admins, 'read', db.GroupPerspective, group_one)
        auth.add_permission(group_one_admins, 'update', db.GroupPerspective, group_one)
        auth.add_permission(group_one_admins, 'delete', db.GroupPerspective, group_one)

        group_two = db.GroupPerspective.insert(name=form.vars.name2, description=form.vars.desc2, id_conflict=cid)
        group_two_members = auth.add_group('group_%s_members' % group_two, 'Member role for group_%s' % group_two)
        group_two_admins = auth.add_group('group_%s_admins' % group_two, 'Admin role for group_%s' % group_two)
        auth.add_permission(group_two_members, 'read', db.GroupPerspective, group_two)
        auth.add_permission(group_two_admins, 'read', db.GroupPerspective, group_two)
        auth.add_permission(group_two_admins, 'update', db.GroupPerspective, group_two)
        auth.add_permission(group_two_admins, 'delete', db.GroupPerspective, group_two)

        # Finally create the required maps
        # loop through group_id, second_group_id,
        map_info = (
            [form.vars.name1 + "'s perspective", group_one, group_one], 
            [form.vars.name1 + "'s perspective according to " + form.vars.name2, group_one, group_two], 
            [form.vars.name2 + "'s perspective", group_two, group_two], 
            [form.vars.name2 + "'s perspective according to " + form.vars.name1, group_two, group_one])

        for info in map_info:
            map_id = db.Map.insert(title=info[0], id_group = info[1], id_secondary = info[2])
            member_group_id = auth.id_group('group_%s_members' % info[1])
            admin_group_id = auth.id_group('group_%s_admins' % info[2])
            auth.add_permission(member_group_id, 'read', db.Map, map_id)
            auth.add_permission(member_group_id, 'update', db.Map, map_id)
            auth.add_permission(admin_group_id, 'read', db.Map, map_id)
            auth.add_permission(admin_group_id, 'update', db.Map, map_id)
            auth.add_permission(admin_group_id, 'delete', db.Map, map_id)
            auth.add_membership(member_group_id)
            auth.add_membership(admin_group_id)
        
        for email in form.vars.users1.split(','):
            if(email != auth.user.email and len(email) > 0):
                user_id = db(db.auth_user.email == email).select().first()
                invite_id = db.Invite.insert(invitee_email = email, id_user = user_id, id_group = group_one, inviter_email = auth.user.email)
                if settings.web2py_runtime_gae:
                    taskqueue.add(url='/empathica/conflict/send_invite_email/%s' % (invite_id), method='GET')
        for email in form.vars.users2.split(','):
            if(email != auth.user.email and len(email) > 0):
                user_id = db(db.auth_user.email == email).select().first()
                invite_id = db.Invite.insert(invitee_email = email, id_user = user_id, id_group = group_two, inviter_email = auth.user.email)
                if settings.web2py_runtime_gae:
                    taskqueue.add(url='/empathica/conflict/send_invite_email/%s' % (invite_id), method='GET')

        redirect(URL('overview', args=[cid]))
    elif form.errors:
        response.flash = "Please make corrections to the form"
    return dict(form=form)

@auth.requires_login()
def manage():
    response.title = "Manage Conflicts"

    open = []
    closed = []
    conflicts = db(db.Conflict.authorized_users.contains(auth.user.id)).select()

    for conflict in conflicts:
        admin_group = auth.id_group('conflict_%s_admin' % conflict.id)
        is_admin = False
        if(auth.has_membership(admin_group)):
            is_admin = True
        groups = db(db.GroupPerspective.id_conflict == conflict.id).select()
        conflictD = conflict.as_dict()
        conflictD['is_admin'] = True
        record = {
            'conflict' : conflictD,
            'groups' : groups.as_dict().values()
        }
        if conflict.open_conflict == True:
            open.append(record)
        else:
            closed.append(record)

    invites = []
    for invite in db(db.Invite.id_user == auth.user.id).select():
        group = db.GroupPerspective[invite.id_group]
        conflict = db.Conflict[group.id_conflict]
        invite = {
            'id' : invite.id , 
            'conflict' : conflict.title, 
            'invite_from' : invite.inviter_email, 
            'group' : group.name
        }
        invites.append(invite)

    return dict(open=open, closed=closed, invites=invites)

@auth.requires_login()
def overview():
    try:
        conflict_id = request.args(0)
        conflict = db.Conflict[conflict_id]
        authorized_conflicts = [c.id for c in db(db.Conflict.authorized_users.contains(auth.user.id)).select(db.Conflict.id)]
        if(conflict.id in authorized_conflicts):
            is_admin = False
            admin_group_id = auth.id_group('conflict_%s_admin' % conflict_id)
            if(auth.has_membership(admin_group_id)):
                is_admin = True
            groups = db(db.GroupPerspective.id_conflict == conflict_id).select()
            
            for group in groups:
                group['maps'] = db((db.Map.id_group == group.id) & (db.Map.id_secondary == group.id)).select().as_dict().values()
                
            
            # TEMP HAX -- REMOVE 2 CAMS
            #groups[0]['maps'].pop();
            #groups[1]['maps'].pop();
            
            response.title = "Overview - %s" % conflict.title
            return dict(conflict=conflict.as_dict(), groups = groups.as_dict().values(), is_admin = is_admin)
        else:
            raise HTTP(403)
    except KeyError:
        raise HTTP(400)

    return dict()

@auth.requires_login()
def correlate():
    """
    need list of all nodes in graph a
    need list of all nodes in graph b
    need list of paired nodes
    need to restrict access
    """

    id_one = None
    id_two = None
    if(int(request.args(0)) < int(request.args(1))):
        id_one = int(request.args(0))
        id_two = int(request.args(1))
    else:
        id_one = int(request.args(1))
        id_two = int(request.args(0))
        
    graph_one = db.Map(id_one)
    graph_two = db.Map(id_two)
    
    if not graph_one or not graph_two:
        raise HTTP(400)

    if(graph_one.id_group.id_conflict.id != graph_two.id_group.id_conflict.id):
        raise HTTP(400)

    conflict = db.Conflict(graph_one.id_group.id_conflict)
    
    graph_one_nodes = []
    graph_two_nodes = []
    related_nodes = [] 
    
    graph_one_nodes = db(db.Node.id_map == graph_one).select()
    filtered_graph_one = []
    for node in graph_one_nodes:
        if db(db.NodeMapping.node_one == node.id).count() == 0:
            filtered_graph_one.append(node)
    
    graph_two_nodes = db(db.Node.id_map == graph_two).select()
    filtered_graph_two = []
    for node in graph_two_nodes:
        if db(db.NodeMapping.node_two == node.id).count() == 0:
            filtered_graph_two.append(node)
            
    mapping = db(db.NodeMapping.map_one == graph_one or db.NodeMapping.map_two == graph_two).select()
    
    related_nodes = []
    for relation in mapping:
        related_nodes.append((relation.node_one.id_map, relation.node_one.id, relation.node_one.name, relation.node_two.id_map, relation.node_two.id, relation.node_two.name, relation.identical))

    return dict(conflict = conflict, a_nodes = filtered_graph_one, b_nodes = filtered_graph_two, related_nodes = related_nodes)
    
@auth.requires_login()
def compare():
    id_one = None
    id_two = None
    if(int(request.args(0)) < int(request.args(1))):
        id_one = int(request.args(0))
        id_two = int(request.args(1))
    else:
        id_one = int(request.args(1))
        id_two = int(request.args(0))
        
    graph_one = db.Map(id_one)
    graph_two = db.Map(id_two)
    
    conflict = graph_one.id_group.id_conflict
    
    lookup_table = []
    opposite_nodes = []
    
    one_to_harm = {}
    two_to_harm = {}
    
    for record in db((db.NodeMapping.map_one == graph_one) & (db.NodeMapping.map_two == graph_two)).select():
        lookup_table.append((record.id, record.map_one, record.node_one, record.map_two, record.node_two, record.identical))
        if(record.identical == False):
            opposite_nodes.append((record.node_two.id))
    
    for n in db(db.Node.id_map == graph_one).select():
        found = False
        for record in lookup_table:
            if((record[2]) == n.id):
                one_to_harm[n.id] = record[0]
                found = True
                break
        if found == False:
            import random
            i = random.random()
            one_to_harm[n.id] = i
            lookup_table.append((i, graph_one.id, n.id, graph_two.id, None, None))
    
    for n in db(db.Node.id_map == graph_two).select():
        found = False
        for record in lookup_table:
            if((record[4]) == n.id):
                two_to_harm[n.id] = record[0]
                found = True
                break
        if found == False:
            import random
            i = random.random()
            two_to_harm[n.id] = i
            lookup_table.append((i, graph_one.id, None, graph_two.id, n.id, None))
    
    harm_map_one = {}
    for n in db(db.Node.id_map == graph_one).select():
        for record in lookup_table:
            if record[2] == n.id:
                harm_map_one[record[0]] = n.valence
                
    harm_map_two = {}
    for n in db(db.Node.id_map == graph_two).select():
        for record in lookup_table:
            if record[4] == n.id:
                multiplier = 1.0
                if(n.id in opposite_nodes):
                    multiplier = -1.0
                harm_map_two[record[0]] = n.valence * multiplier
    
    for record in lookup_table:
        if record[2] is None:
            harm_map_one[record[0]] = 0
        if record[4] is None:
            harm_map_two[record[0]] = 0
            
    harm_adj_one = {}
    for id in harm_map_one:
        harm_adj_one[id] = {}
    
    harm_adj_two = {}
    for id in harm_map_two:
        harm_adj_two[id] = {}
    
    for edge in db(db.Connection.id_map == graph_one).select():
        harm_adj_one[one_to_harm[edge.id_first_node]][one_to_harm[edge.id_second_node]] = edge.valence
        harm_adj_one[one_to_harm[edge.id_second_node]][one_to_harm[edge.id_first_node]] = edge.valence
    
    for edge in db(db.Connection.id_map == graph_two).select():
        multipler = 1.0
        if edge.id_first_node in opposite_nodes:
            multiplier = multiplier * -1.0
        if edge.id_second_node in opposite_nodes:
            multiplier = multiplier * -1.0
        harm_adj_two[two_to_harm[edge.id_first_node]][two_to_harm[edge.id_second_node]] = edge.valence * multiplier
        harm_adj_two[two_to_harm[edge.id_second_node]][two_to_harm[edge.id_first_node]] = edge.valence * multiplier
    
    GraphComprehension = local_import('GraphComprehension')
    
    gc = GraphComprehension.GraphComprehender()
    
    difference = gc.graph_diff(harm_map_one, harm_adj_one, harm_map_two, harm_adj_two)
    
    ret_list = []
    
    for (val, id) in difference:
        for record in lookup_table:
            if id == record[0]:
                if record[2] is not None:
                    ret_list.append((val, db.Node(record[2]).name))
                else:
                    ret_list.append((val, db.Node(record[4]).name))
    
    return dict(conflict = conflict, ret_list = ret_list)
    
@auth.requires_login()
def compromise():
    id_one = None
    id_two = None
    if(int(request.args(0)) < int(request.args(1))):
        id_one = int(request.args(0))
        id_two = int(request.args(1))
    else:
        id_one = int(request.args(1))
        id_two = int(request.args(0))
        
    graph_one = db.Map(id_one)
    graph_two = db.Map(id_two)
    
    conflict = graph_one.id_group.id_conflict
    group1 = graph_one.id_group.name
    group2 = graph_two.id_group.name
    
    lookup_table = []
    opposite_nodes = []
    
    one_to_harm = {}
    two_to_harm = {}
    
    for record in db((db.NodeMapping.map_one == graph_one) & (db.NodeMapping.map_two == graph_two)).select():
        lookup_table.append((record.id, record.map_one, record.node_one, record.map_two, record.node_two, record.identical))
        if(record.identical == False):
            opposite_nodes.append((record.node_two.id))
    
    for n in db(db.Node.id_map == graph_one).select():
        found = False
        for record in lookup_table:
            if((record[2]) == n.id):
                one_to_harm[n.id] = record[0]
                found = True
                break
        if found == False:
            import random
            i = random.random()
            one_to_harm[n.id] = i
            lookup_table.append((i, graph_one.id, n.id, graph_two.id, None, None))
    
    for n in db(db.Node.id_map == graph_two).select():
        found = False
        for record in lookup_table:
            if((record[4]) == n.id):
                two_to_harm[n.id] = record[0]
                found = True
                break
        if found == False:
            import random
            i = random.random()
            two_to_harm[n.id] = i
            lookup_table.append((i, graph_one.id, None, graph_two.id, n.id, None))
    
    harm_map_one = {}
    for n in db(db.Node.id_map == graph_one).select():
        for record in lookup_table:
            if record[2] == n.id:
                harm_map_one[record[0]] = n.valence
                
    harm_map_two = {}
    for n in db(db.Node.id_map == graph_two).select():
        for record in lookup_table:
            if record[4] == n.id:
                multiplier = 1.0
                if(n.id in opposite_nodes):
                    multiplier = -1.0
                harm_map_two[record[0]] = n.valence * multiplier
    
    for record in lookup_table:
        if record[2] is None:
            harm_map_one[record[0]] = 0
        if record[4] is None:
            harm_map_two[record[0]] = 0
            
    harm_adj_one = {}
    for id in harm_map_one:
        harm_adj_one[id] = {}
    
    harm_adj_two = {}
    for id in harm_map_two:
        harm_adj_two[id] = {}
    
    for edge in db(db.Connection.id_map == graph_one).select():
        harm_adj_one[one_to_harm[edge.id_first_node]][one_to_harm[edge.id_second_node]] = edge.valence
        harm_adj_one[one_to_harm[edge.id_second_node]][one_to_harm[edge.id_first_node]] = edge.valence
    
    for edge in db(db.Connection.id_map == graph_two).select():
        multipler = 1.0
        if edge.id_first_node in opposite_nodes:
            multiplier = multiplier * -1.0
        if edge.id_second_node in opposite_nodes:
            multiplier = multiplier * -1.0
        harm_adj_two[two_to_harm[edge.id_first_node]][two_to_harm[edge.id_second_node]] = edge.valence * multiplier
        harm_adj_two[two_to_harm[edge.id_second_node]][two_to_harm[edge.id_first_node]] = edge.valence * multiplier
    
    GraphComprehension = local_import('GraphComprehension')
    
    gc = GraphComprehension.GraphComprehender()
    
    (solns, best_sol) = gc.compromise(harm_map_one, harm_adj_one, harm_map_two, harm_adj_two)
    
    harm_to_ab = {}
    for record in lookup_table:
        harm_to_ab[record[0]] = (record[2], record[4])
    
    
    ret_list = []
    for sol in solns:
        ret_val = []
        for c in sol[2]:
            if harm_to_ab[c][0] != None:
                ret_val.append((db.Node(harm_to_ab[c][0]).name,sol[2][c]))
            else:
                ret_val.append((db.Node(harm_to_ab[c][1]).name,sol[2][c]))
        ret_list.append((sol[0],sol[1],ret_val))
    
    return dict(conflict = conflict, ret_list = ret_list, best_sol = best_sol, group1=group1, group2=group2)
    
@auth.requires_login()
def summary_print():
    try:
        conflict_id = request.vars['conflict_id']
        if(auth.has_permission(db.Conflict, 'read', conflict_id)):
            response.title = "Print Conflict Summary"
            return dict()
        else:
            raise HTTP(403)
    except KeyError:
        raise HTTP(400)

@auth.requires_login()
def invite():
    group_id = request.args(0)
    group = db.GroupPerspective[group_id]
    form = FORM('Email:', INPUT(_name='invitee_email'),
                INPUT(_type='submit'))
    if form.accepts(request.vars):
        user_id = None
        existingUser = db(db.auth_user.email == form.vars.invitee_email).select()
        if existingUser:
            user_id = existingUser[0].id
        invite_id = db.Invite.insert(invitee_email = form.vars.invitee_email, id_user = user_id, id_group = group_id, inviter_email = auth.user.email)
        from google.appengine.api import taskqueue
        taskqueue.add(url='/empathica/conflict/send_invite_email/%s' % (invite_id), method='GET')
        redirect(URL('manage'))
    elif form.errors:
        response.flash = form.errors
    return dict(form = form, group = group.as_dict())

@auth.requires_login()
def accept_invite():
    invite = db.Invite[request.args(0)]
    if(auth.user.id == invite.id_user):
        # This user is the original intended recipient, all ok
        group = db.GroupPerspective[invite.id_group]
        perspective_groupid = auth.id_group('group_%s_members' % (invite.id_group))
        authorized_users = db.Conflict[group.id_conflict].authorized_users
        authorized_users.append(invite.id_user)
        db.Conflict[group.id_conflict] = dict(authorized_users=authorized_users)
        conflict_groupid = auth.id_group('conflict_%s_members' % (db.Conflict[group.id_conflict].id))
        auth.add_membership(conflict_groupid)
        auth.add_membership(perspective_groupid)
        del db.Invite[invite.id]
        redirect(URL('manage'))

@auth.requires_login()
def ignore_invite():
    invite = db.Invite[request.args(0)]
    if(auth.user.id == invite.id_user):
        # This user is the original intended recipient, all ok
        # Just delete the invite because the user does not want it.
        del db.Invite[invite.id]
        redirect(URL('manage'))

@auth.requires_login()
def claim_token():
    token = request.args(0)

    invite = db(db.Invite.invite_token == token).select()

    if not invite:
        # could be claiming a proxy token
        invite = db(db.Invite.proxy_token == token).select()

        if not invite:
            redirect(URL('manage'))
        invite = invite[0]
        if(auth.user.email == invite.claimed_email):
            db.Invite[invite.id] = dict(id_user = auth.user.id)
            db.commit()

        redirect(URL('manage'))

    else:
        invite = invite[0]
        # we're looking at the original token
        if(auth.user.id == invite.id_user):
            # this user was alredy registered when the invite was sent
            redirect(URL('manage'))

        if((invite.id_user == None) & (auth.user.email == invite.invitee_email)):
            # the original email recipient matches, this user was not registered
            # when the invite was sent
            db.Invite[invite.id] = dict(id_user = auth.user.id)
            db.commit()
            redirect(URL('manage'))
        else:
            #the google account claiming the token is not who the token was sent to
            #we have to email the original account and get them to authorize again
            import uuid
            db.Invite[invite.id] = dict(proxy_token = str(uuid.uuid1()), claimed_email = auth.user.email)
            
            context = dict(claimed = invite.claimed_email, invitee=invite.invitee_email, invitetoken = invite.proxy_token, server = request.env.server_name, port = request.env.server_port)
            message = response.render('invite_authorize.html', context)
            mail.send(to = invite.invitee_email,
              subject = T('You\'re a Wizard, Harry'),
              message = message)
            db.commit()
            redirect(URL('manage'))
        
    return dict()

@auth.requires_login()
def call():
    session.forget()
    return service()


@service.json
def edit_conflict(conflict_id, title, description):
    if(auth.has_permission('update', db.Conflict, conflict_id) == false):
        db.rollback()
        return dict(success=False)
    else:
        db.Conflict[conflict_id] = dict(title=title, description=description)
        db.commit()
        return dict(success=True)

@service.json
def close_conflict(id):
    """
    Updates a conflict to the 'closed' state.

    Parameters:
        - id:
            The database id of the conflict to close
    """
    if(auth.has_permission('update', db.Conflict, id)):
        db.Conflict[id] = dict(open_conflict=False)
        db.commit()
        return dict(success=True)
    else:    
        return dict(success=False)

@service.json
def delete_conflict(id):
    '''
    Deletes a conflict so long as the current user
    has delete permissions for the conflict. Also
    removes the admin and member groups corresponding to the
    conflict. 

    BUGBUG: We need to make sure that deleting a group clears permissions
    '''
    if(auth.has_permission('update', db.Conflict, id)):
        memberGroupId = auth.id_group('conflict_' + str(id) + '_members')
        adminGroupId = auth.id_group('conflict_' + str(id) + '_admin')
        auth.del_group(memberGroupId)
        auth.del_group(adminGroupId)
        db(db.Conflict.id == id).delete()
        db.commit()
        return dict(success=True)
    else:
        return dict(success=False)

# TODO:
# Upload a conflict
# Download a conflict

# Conflict overview

@service.json
def solve_conflict():
    """
    BUGBUG: ensure that the user is allowed to solve this conflict
    """
    from google.appengine.api import taskqueue
    taskqueue.add(url='/empathica/conflict/call/json/compute_conflict', params={'key:': 'test'})
    return dict(success=True)

@service.json
def compute_conflict():
    #TODO: Hard work goes here
    return

@service.json
def edit_title(conflict_id, title):
    if(auth.has_permission('update', db.Conflict, conflict_id) == false):
        db.rollback()
        return dict(success=False)
    else:
        db.Conflict[conflict_id] = dict(title=title)
        db.commit()
        return dict(success=False) 

@service.json
def edit_description(conflict_id, description):
    if(auth.has_permission('update', db.Conflict, conflict_id) == false):
        db.rollback()
        return dict(success=False)
    else:
        db.Conflict[conflict_id] = dict(description=description)
        db.commit()
        return dict(success=True)

@service.json
def create_group(conflict_id, name, description):
    '''
    Adds a group to a conflict.
    NB. A group my be a single person
    '''
    if(auth.has_permission('update', db.Conflict, conflict_id)):
        group_id = db.GroupPerspective.insert(name=name,description=description, id_conflict=conflict_id)
        member_group_id = auth.add_group('group_' + str(group_id) + '_members')
        admin_group_id  = auth.add_group('group_' + str(group_id) + '_admin')

        auth.add_permission(member_group_id, 'read', db.GroupPerspective, group_id)

        auth.add_permission(admin_group_id, 'read', db.GroupPerspective, group_id)
        auth.add_permission(admin_group_id, 'update', db.GroupPerspective, group_id)
        auth.add_permission(admin_group_id, 'delete', db.GroupPerspective, group_id)

        auth.add_membership(member_group_id)
        auth.add_membership(admin_group_id)

        db.commit()
        return dict(success=True, group_id=group_id)
    else:
        db.rollback()
        return dict(success=False)

@service.json
def rename_group(group_id, name):
    if(auth.has_permission('update', db.GroupPerspective, group_id) == false):
        db.rollback()
        return dict(success=False)
    else:
        db.GroupPerspective[group_id] = dict(name=name)
        db.commit()
        return dict(success=True)

@service.json
def delete_group(group_id):
    if(auth.has_permission('delete', db.group, group_id) == false):
        db.rollback()
        return dict(success=False)
    else:
        member_group_id = auth.id_group('group_' + str(group_id) + '_members')
        admin_group_id = auth.id_group('group_' + str(group_id) + '_admin')
        auth.del_group(member_group_id)
        auth.del_group(admin_group_id)

        del db.GroupPerspective[group_id]
        db.commit()
        return dict(success=True)

def send_invite_email():
    invite_id = request.args(0)
    invite = db.Invite[invite_id]

    if not invite:
       logging.info('Got a null invite id. Not sending anything')
       return

    if invite.email_sent == True:
        logging.info('Already sent invite %s' % invite.id)
        return
    
    context = dict(inviter=invite.inviter_email, invitetoken = invite.invite_token, server = request.env.server_name, port = request.env.server_port)
    message = response.render('invitation.html', context)
    mail.send(to = invite.invitee_email,
              subject = T('Invitation to Participate in Conflict Resolution'),
              message = message)
    db.Invite[invite_id] = dict(email_sent = True)
    db.commit()
    return 

@service.json
def create_map(group_id, group_secondary_id, title):
    '''
    Creates a map given two groups in a conflict.
    Returns the id of the created map
    '''
    if(auth.has_permission('read', db.GroupPerspective, group_id)):
        map_id = db.Map.insert(title=title, id_group=group_id, id_secondary=group_secondary_id)
        member_group_id = auth.id_group('group_' + str(group_id) + '_members')
        admin_group_id = auth.id_group('group_' + str(group_id) + '_admin')

        auth.add_permission(member_group_id, 'read', db.Map, map_id)

        auth.add_permission(admin_group_id, 'read', db.Map, map_id)
        auth.add_permission(admin_group_id, 'update', db.Map, map_id)
        auth.add_permission(admin_group_id, 'delete', db.Map, map_id)

        auth.add_membership(member_group_id)
        auth.add_membership(admin_group_id)

        db.commit()

        return dict(success=True, map_id=map_id)
    else:
        db.rollback()
        return dict(success=False)

@service.json
def delete_map(map_id):
    if(auth.has_permission('delete', db.Map, map_id)):
        #Clear nodes and connections from the map
        del db.Map[map_id]
        db.commit()
        return dict(success=True)
    else:
        db.rollback()
        return dict(success=False)

@service.json
def correlate_nodes(map1, map2):

    db(db.NodeMapping.map_one == map1).delete()
    db(db.NodeMapping.map_two == map2).delete()
    
    pairs = json.loads(request.body.read())
    for pair in pairs:
        map1 = int(pair[0])
        node1 = int(pair[1])
        map2 = int(pair[2])
        node2 = int(pair[3])
        same = pair[4]
        if map1 > map2:
            map1, map2 = map2, map1
            node1, node2 = node2, node1
        db.NodeMapping.insert(map_one = map1, node_one = node1, map_two = map2, node_two = node2, identical = same)

    return dict(success=True, pairs=pairs)