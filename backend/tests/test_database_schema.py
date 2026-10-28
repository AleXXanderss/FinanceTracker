from app.db.database import Base
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.recurring_transaction import RecurringTransaction
from app.models.tag import Tag
from app.models.transaction_tag import TransactionTag
from app.models.enums import TransactionType


def test_database_models_are_registered():
    model_names = {
        model.__tablename__
        for model in [
            User,
            Category,
            Transaction,
            Budget,
            RecurringTransaction,
            Tag,
            TransactionTag,
        ]
    }

    assert "users" in model_names
    assert "categories" in model_names
    assert "transactions" in model_names
    assert "budgets" in model_names
    assert "recurring_transactions" in model_names
    assert "tags" in model_names
    assert "transaction_tags" in model_names


def test_transaction_type_enum_is_available():
    assert TransactionType.income.value == "income"
    assert TransactionType.expense.value == "expense"


def test_model_relationships_can_be_defined():
    assert hasattr(User, "categories")
    assert hasattr(User, "transactions")
    assert hasattr(User, "budgets")
    assert hasattr(User, "recurring_transactions")
    assert hasattr(User, "tags")
    assert hasattr(Transaction, "transaction_tags")
    assert hasattr(Tag, "transaction_tags")
    assert hasattr(Category, "transactions")
