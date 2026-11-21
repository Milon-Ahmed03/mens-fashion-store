const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');
const c = require('../controllers/categoryController');

const router = express.Router();
const rules = [body('name').trim().notEmpty().withMessage('Category name is required')];

router.get('/', c.list); // সবাই দেখতে পারবে
router.post('/', protect, adminOnly, rules, validate, c.create);
router.put('/:id', protect, adminOnly, c.update);
router.delete('/:id', protect, adminOnly, c.remove);

module.exports = router;
