'use strict'

const { Router } = require('express')
const MediaController = require('../controllers/media.controller')
const authenticate    = require('../middlewares/auth.middleware')
const { authorize }   = require('../middlewares/rbac.middleware')
const validate        = require('../middlewares/validate.middleware')
const upload          = require('../middlewares/upload.middleware')
const {
  idParam,
  listSchema,
  createSchema,
  uploadSchema,
  reuploadSchema,
  updateSchema,
} = require('../validations/media.validation')

const router = Router()

// ── Collection ────────────────────────────────────────────────────────────────

router
  .route('/')
  .get(authenticate,  authorize('media:read'),   validate(listSchema),   MediaController.getAll)
  .post(authenticate, authorize('media:create'), validate(createSchema), MediaController.create)

// ── Image upload (creates new record) ─────────────────────────────────────────
// Defined BEFORE /:id so Express does not treat "upload" as an id parameter.

router.post(
  '/upload',
  authenticate,
  authorize('media:create'),
  upload.single('file'),    // multer parses multipart → req.file + req.body
  validate(uploadSchema),   // validate text fields (alt) after multer
  MediaController.upload,
)

// ── Single record ─────────────────────────────────────────────────────────────

router
  .route('/:id')
  .get(authenticate,    authorize('media:read'),   validate(idParam),      MediaController.getById)
  .put(authenticate,    authorize('media:update'), validate(updateSchema),  MediaController.update)
  .delete(authenticate, authorize('media:delete'), validate(idParam),      MediaController.delete)

// ── Re-upload image for an existing record ────────────────────────────────────

router.post(
  '/:id/reupload',
  authenticate,
  authorize('media:update'),
  upload.single('file'),
  validate(reuploadSchema),
  MediaController.reupload,
)

module.exports = router
