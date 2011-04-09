from gluon.html import * 
from gluon.sqlhtml import * 
from gluon.validators import * 

class MyModulo: 
    def __init__(self,request,response,session,cache,T,db):
		self.request,self.response,self.session,self.cache,self.T,self.db=request,response,session,cache,T,db 
    def my_funcion(self): 
		request,response,session,cache,T,db=self.request,self.response,self.session,self.cache,self.T,self.db 
		print "una funcion" 
		return db(db.Conflict.authorized_users.contains(auth.user.id)).select()