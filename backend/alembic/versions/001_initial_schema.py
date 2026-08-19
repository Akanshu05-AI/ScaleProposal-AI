"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-19 19:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'proposals',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('workflow_id', sa.String(length=64), nullable=False),
        sa.Column('company_name', sa.String(length=100), nullable=False),
        sa.Column('project_type', sa.String(length=100), nullable=False),
        sa.Column('requirements', sa.Text(), nullable=False),
        sa.Column('budget_target', sa.String(length=100), nullable=True),
        sa.Column('deadline_target', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('estimated_total', sa.Float(), nullable=True),
        sa.Column('pricing_range', sa.String(length=100), nullable=True),
        sa.Column('timeline', sa.String(length=100), nullable=True),
        sa.Column('overall_risk_level', sa.String(length=20), nullable=True),
        sa.Column('total_execution_time', sa.String(length=20), nullable=True),
        sa.Column('planner_output', sa.JSON(), nullable=True),
        sa.Column('pricing_output', sa.JSON(), nullable=True),
        sa.Column('risk_output', sa.JSON(), nullable=True),
        sa.Column('proposal_output', sa.JSON(), nullable=True),
        sa.Column('final_markdown', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_proposals_company_name'), 'proposals', ['company_name'], unique=False)
    op.create_index(op.f('ix_proposals_project_type'), 'proposals', ['project_type'], unique=False)
    op.create_index(op.f('ix_proposals_status'), 'proposals', ['status'], unique=False)
    op.create_index(op.f('ix_proposals_workflow_id'), 'proposals', ['workflow_id'], unique=True)

    op.create_table(
        'agent_executions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('proposal_id', sa.String(length=36), nullable=False),
        sa.Column('agent_name', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('execution_time', sa.String(length=20), nullable=True),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['proposal_id'], ['proposals.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_executions_agent_name'), 'agent_executions', ['agent_name'], unique=False)
    op.create_index(op.f('ix_agent_executions_proposal_id'), 'agent_executions', ['proposal_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_agent_executions_proposal_id'), table_name='agent_executions')
    op.drop_index(op.f('ix_agent_executions_agent_name'), table_name='agent_executions')
    op.drop_table('agent_executions')
    op.drop_index(op.f('ix_proposals_workflow_id'), table_name='proposals')
    op.drop_index(op.f('ix_proposals_status'), table_name='proposals')
    op.drop_index(op.f('ix_proposals_project_type'), table_name='proposals')
    op.drop_index(op.f('ix_proposals_company_name'), table_name='proposals')
    op.drop_table('proposals')
