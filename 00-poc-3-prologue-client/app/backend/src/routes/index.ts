import { Router } from 'express';
import { authn } from '../middleware/auth.js';
import shellRouter from './shell.routes.js';
import journalEntriesRouter from './journalEntries.routes.js';
import accountsRouter from './accounts.routes.js';
import accrualSchedulesRouter from './accrualSchedules.routes.js';
import allocationRulesRouter from './allocationRules.routes.js';
import budgetsRouter from './budgets.routes.js';
import consolidationRouter from './consolidation.routes.js';
import fiscalYearsRouter from './fiscalYears.routes.js';
import reportDesignsRouter from './reportDesigns.routes.js';
import transactionsRouter from './transactions.routes.js';

const router = Router();

// Public routes (no auth): healthz, readyz, metrics, api-docs
router.use('/', shellRouter);

// All subsequent routes require authentication
router.use(authn);

// Protected routes
router.use('/journal-entries', journalEntriesRouter);
router.use('/accounts', accountsRouter);
router.use('/accrual-schedules', accrualSchedulesRouter);
router.use('/allocation-rules', allocationRulesRouter);
router.use('/budgets', budgetsRouter);
router.use('/consolidation', consolidationRouter);
router.use('/fiscal-years', fiscalYearsRouter);
router.use('/report-designs', reportDesignsRouter);
router.use('/transactions', transactionsRouter);

export default router;
