from flask import Flask, request, jsonify
import config as cfg
import tests
from datetime import timedelta
from flask import make_response, current_app
from functools import update_wrapper

app = Flask(__name__)


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, str):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, str):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            # h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Allow-Methods'] = "*"
            h['Access-Control-Max-Age'] = str(max_age)
            # if headers is not None:
                # h['Access-Control-Allow-Headers'] = headers
            h['Access-Control-Allow-Headers'] = "content-type"

            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


@app.route('/users/<uid>')
def fetch_user(uid=None):
    cur_user = cfg.users.find_one({"uid": str(uid)})
    if cur_user:
        result = cur_user.copy()
        result["_id"] = str(result["_id"])
        return jsonify(result)


@app.route('/tests', methods=['OPTIONS', 'POST'])
@crossdomain(origin='*')
def regist_test():
    if request.method == "POST":
        data = request.get_data()
        x = data.decode("utf8").split("//")
        if x[0] != "jiongjidanci":
            return "Invalid Password"
        add_result = tests.add_test(x[1])
        if add_result == 1:
            return "OK"
        return "Insertion Failed"



# @app.route('/user', methods=['GET', 'POST'])
# def regist_user():
#     if request.method == "POST":
#

if __name__ == "__main__":
    app.run(host='0.0.0.0')