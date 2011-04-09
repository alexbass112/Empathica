#from gluon.tools import Crud
#crud = Crud(globals(), db)


#http://groups.google.com/group/web2py/browse_thread/thread/6fec7ee7e677b49c
#from applications.empathica.modules.test import MyModulo 
#modulo=MyModulo(request,response,session,cache,T,db) 

def new_conflict(form):
    form.errors.title = "Fuck"

@auth.requires_login()
def test():
    conflicts = db(db.Conflict.authorized_users.contains(auth.user.id)).select()
    
    """
    for conflict in conflicts:
        groups = db(db.GroupPerspective.id_conflict == conflict.id).select()
        conflict.update(groups.as_dict())
    """
    #conflicts = modulo.my_funcion()

    form = FORM(
        DIV(
            LABEL("Title:", _for=db.Conflict.title.name),
            INPUT(_name=db.Conflict.title.name, requires=db.Conflict.title.requires),
        _class="row"),
        DIV(
            LABEL("Description:", _for=db.Conflict.description.name),
            TEXTAREA(_name=db.Conflict.description.name, requires=db.Conflict.description.requires),
        _class="row"),
        DIV(
        _class="row"),
        DIV(
            INPUT(_type="submit", _value="Create"),
        _class="row"),
    _method="post", hidden=dict(a='b'))

    if form.accepts(request.vars, formname="NewConflict", onvalidation=new_conflict):
        response.flash = "Success"
    elif form.errors:
        response.flash = "Error"

    return dict(form=form, conflicts=conflicts)