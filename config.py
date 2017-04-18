from pymongo import MongoClient
from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper

db_path = "localhost:27017"

conn = MongoClient(db_path)
users = conn["langtest"]["users"]
tests = conn["langtest"]["tests"]
logs = conn["langtest"]["logs"]
