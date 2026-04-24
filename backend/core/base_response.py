from rest_framework.response import Response


def api_response(success: bool, message: str = "", data=None, status_code: int = 200):
    payload = {"success": success, "message": message, "data": data}
    return Response(payload, status=status_code)


def success_response(message: str = "Success", data=None, status_code: int = 200):
    return api_response(True, message, data, status_code)


def error_response(message: str = "Error", data=None, status_code: int = 400):
    return api_response(False, message, data, status_code)
