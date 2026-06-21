import { supabase } from '../../config/supabase';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { AuditLogRow, PaginatedResponse } from '../../types';

interface AuditLogEntry {
  userId: string;
  action: string;
  module: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

interface AuditSearchQuery {
  userId?: string;
  action?: string;
  module?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}

/**
 * Create an audit log entry.
 * Called from services on every write operation.
 */
const log = async (entry: AuditLogEntry): Promise<void> => {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: entry.userId,
    action: entry.action,
    module: entry.module,
    entity_id: entry.entityId || null,
    metadata: entry.metadata || null,
    ip: entry.ip || null,
  });

  if (error) {
    logger.error('Failed to create audit log:', error);
    // Don't throw — audit log failures should not break main operations
  }
};

/**
 * Search audit logs with filters and pagination.
 */
const search = async (
  query: AuditSearchQuery,
): Promise<PaginatedResponse<AuditLogRow>> => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '50', 10);
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('audit_logs')
    .select('*, users(name, email)', { count: 'exact' });

  if (query.userId) {
    dbQuery = dbQuery.eq('user_id', query.userId);
  }
  if (query.action) {
    dbQuery = dbQuery.eq('action', query.action);
  }
  if (query.module) {
    dbQuery = dbQuery.eq('module', query.module);
  }
  if (query.from) {
    dbQuery = dbQuery.gte('created_at', query.from);
  }
  if (query.to) {
    dbQuery = dbQuery.lte('created_at', query.to);
  }

  const { data, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Audit log search error:', error);
    throw new AppError('Failed to fetch audit logs', 500);
  }

  const total = count || 0;

  return {
    items: (data || []) as AuditLogRow[],
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  };
};

export const auditService = {
  log,
  search,
};
