from rest_framework.pagination import PageNumberPagination # type: ignore

class CustomPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'  # Allow clients to set the page size via query parameter
    max_page_size = 1000  # Set a maximum page size to prevent abuse