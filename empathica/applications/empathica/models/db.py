"""
BEGINNING OF DBPY FILE
"""
from gluon.settings import settings
from gluon.tools import *
import uuid
from datetime import datetime

mail = Mail()

# if running on Google App Engine
if settings.web2py_runtime_gae:
    from gluon.contrib.login_methods.gae_google_account import GaeGoogleAccount
    from gluon.contrib.gql import *
    # connect to Google BigTable
    db = DAL('gae')
    # and store sessions there
    session.connect(request, response, db=db)

    mail.settings.server = 'gae'
    mail.settings.sender = 'noreply@uw-empathica.appspotmail.com'
    mail.settings.login = None
else:
    # if not, use SQLite or other DB
    db = DAL('sqlite://storage.sqlite')

auth = Auth(globals(), db)

if settings.web2py_runtime_gae:
    auth.settings.login_form=GaeGoogleAccount()

auth.settings.mailer = 'gae'
auth.define_tables()

# redirect after login
auth.settings.login_next = URL('conflict', 'manage')
auth.settings.logout_next = URL('default', 'index')
# TODO: May need to define other redirects
# messages
auth.messages.logged_in = 'Signed in'
auth.messages.logged_out = 'Signed out'

service = Service(globals())

#### current_user_id = (auth.user and auth.user.id) or 0

# Field Requirements
# (strings should match /static/js/jquery.validationEngine-en.js)
__NOT_EMPTY = IS_NOT_EMPTY(error_message=T("* This field is required"))
__MAX40 = IS_LENGTH(maxsize=40, error_message=T("* Maximum 40 characters allowed"))
__MAX140 = IS_LENGTH(maxsize=140, error_message=T("* Maximum 140 characters allowed"))
__MAX2K = IS_LENGTH(maxsize=2000, error_message=T("* Maximum 2,000 characters allowed"))

# Table Definitions
db.define_table('Conflict',
        Field('title', 'string', requires=[__NOT_EMPTY, __MAX40]),
        Field('description', 'text', requires=[__MAX2K]),
        Field('open_conflict', 'boolean',
            default=True,
            writable=False, readable=False),
        Field('date_created', 'datetime',
            default=datetime.utcnow(),
            writable=False, readable=False),
        Field('date_modified', 'datetime',
            default=datetime.utcnow(),
            writable=False, readable=False),
        Field('id_creator', db.auth_user,
            writable=False, readable=False),
        Field('authorized_users', 'list:reference auth_user',
            writable=False, readable=False))

db.define_table('GroupPerspective',
        Field('name', 'string', requires=[__NOT_EMPTY, __MAX40]),
        Field('description', 'string', requires = [__MAX2K]),
        Field('id_conflict', db.Conflict,
            writable=False, readable=False))

# Temporary fields used to generate an SQLFORM
# (workaround due to limitation with duplicate field names)
db.define_table('GroupTempInput',
        Field('name1', 'string', requires=db.GroupPerspective.name.requires),
        Field('desc1', 'text', requires=db.GroupPerspective.description.requires),
        Field('users1', 'string'),
        Field('name2', 'string', requires=db.GroupPerspective.name.requires),
        Field('desc2', 'text', requires=db.GroupPerspective.description.requires),
        Field('users2', 'string'))

db.define_table('Map',
        Field('title', 'string'),
        Field('id_group', db.GroupPerspective),
        Field('id_secondary', db.GroupPerspective),
        Field('date_modified', 'datetime', default = datetime.utcnow() ),
        Field('modified_by', 'string'),
        Field('is_empty', 'boolean', default = True, notnull=True),
        Field('thumbnail', 'blob'),
        Field('imgdata', 'blob'),
        Field('show_title', 'string', default = "true"),
        Field('theme', 'string', default = "Default Theme"))

db.define_table('Node',
        Field('name', 'string'),
        Field('valence', 'double'),
        Field('x', 'double'),
        Field('y', 'double'),
        Field('width', 'double'),
        Field('height', 'double'),
        Field('id_map', db.Map),
        Field('visible', 'boolean', default = True),
        Field('subsumes', 'list:reference Node'),
        Field('opposite', 'list:reference Node'))

db.define_table('NodeMapping',
        Field('node_one', db.Node),
        Field('map_one' , db.Map),
        Field('node_two', db.Node),
        Field('map_two' , db.Map),
        Field('identical', 'boolean'))

db.define_table('Connection',
        Field('id_first_node', db.Node),
        Field('id_second_node', db.Node),
        Field('valence', 'double'),
        Field('inner_points', 'string'),
        Field('id_map', db.Map))

#TODO: Decorate for SQLFORM
db.define_table('Invite',
        Field('invitee_email', 'string', label="Email", notnull=True),
        Field('id_user', db.auth_user, writable=False),
        Field('claimed_email', 'string'),
        Field('proxy_token', 'string'),
        Field('id_group', db.GroupPerspective),
        Field('inviter_email', 'string'),
        Field('invite_token', 'string', default = str(uuid.uuid1())),
        Field('date_invited', 'date', default = request.now),
        Field('email_sent', 'boolean', default = False))

#todo: expand this
db.Invite.invitee_email.requires = [
    IS_NOT_EMPTY(error_message=T("MSG TBD"))
]
db.Invite.id_group.requires = [
        IS_IN_DB(db, db.GroupPerspective.id)
]

db.define_table('ChatSession',
        Field('id_map',db.Map),
        Field('expected_archetype', 'string'),
        Field('rate_variable', db.Node),
        Field('connect_one', db.Node),
        Field('connect_two', db.Node))

db.define_table('ChatVariables',
        Field('id_map',db.Map),
        Field('variable','string'),
        Field('value','string'))

db.define_table('GrammarLogs',
        Field('raw_text','string'),
        Field('pos_tags','string'))

db.define_table('ChatGrammars',
        Field('grammar_name', 'string'),
        Field('pos_list', 'string'),
        Field('variable_name', 'string'))

db.define_table('ChatResponses',
        Field('expectation', 'integer'),
        Field('response', 'string'))

db.define_table('ChatQuestions',
        Field('question','string'),
        Field('reply','string'),
        Field('query','string'))