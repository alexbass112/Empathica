def index():

    return dict()

def about():
    response.title = "About"
    return dict()

def tutorial():
    response.title = "Tutorial"
    return dict()

def user():
    return dict(form=auth())
