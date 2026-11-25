
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# -------------------------
# USER REGISTRATION
# -------------------------

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):

    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    try:
        # Create organization
        new_organization = Organization(
            name=user_data.organization_name
        )

        db.add(new_organization)
        db.flush()

        # Hash password
        hashed_password = hash_password(
            user_data.password
        )

        # Create user
        new_user = User(
    name=user_data.organization_name,
    email=user_data.email,
    hashed_password=hashed_password,
    organization_id=new_organization.id
)

        db.add(new_user)
        db.flush()

        # Generate JWT token
        access_token = create_access_token({
            "sub": str(new_user.id),
            "org_id": new_organization.id
        })

        # Save database changes
        db.commit()

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except Exception:
        db.rollback()
        raise


# -------------------------
# USER LOGIN
# -------------------------

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db)
):

    # Find user by email
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    # Verify credentials
    if not user or not verify_password(
        user_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    access_token = create_access_token({
        "sub": str(user.id),
        "org_id": user.organization_id
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
