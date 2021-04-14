"""
Test GraphQL endpoint
"""
import pytest
from graphene import Schema
from graphene.test import Client
from forest_lite.server.routers.graphql import Query


@pytest.fixture
def client():
    schema = Schema(query=Query)
    return Client(schema)


def test_schema_color_schemes_by_kind(client):
    response = client.execute('''
        {
            colorSchemes(kind: SEQUENTIAL) {
                name
            }
        }
    ''')
    actual = [item["name"] for item in response["data"]["colorSchemes"]]
    assert "Blues" in actual
    assert "Set3" not in actual


def test_schema_color_schemes_by_kind_and_level(client):
    """Example using variables with GraphQL query syntax"""
    response = client.execute('''
        query Query($rank: Int) {
            colorSchemes(kind: QUALITATIVE, rank: $rank) {
                name
            }
        }
    ''', variables={ "rank": 10 })
    actual = [item["name"] for item in response["data"]["colorSchemes"]]
    assert actual == [ "Set3", "Paired" ]
