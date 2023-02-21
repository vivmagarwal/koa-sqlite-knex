const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
});

const app = new Koa();
const router = new Router();

// Middleware
app.use(bodyParser());

// Routes
router.get('/', async (ctx) => {
  const items = await knex('items').select('*');
  ctx.body = items;
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const item = await knex('items').where({ id }).first();
  if (!item) {
    ctx.throw(404, 'Item not found');
  }
  ctx.body = item;
});

router.post('/', async (ctx) => {
  const { name, description } = ctx.request.body;
  const [id] = await knex('items').insert({ name, description });
  const item = await knex('items').where({ id }).first();
  ctx.body = item;
});

router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { name, description } = ctx.request.body;
  const updated = await knex('items').where({ id }).update({ name, description });
  if (!updated) {
    ctx.throw(404, 'Item not found');
  }
  const item = await knex('items').where({ id }).first();
  ctx.body = item;
});

router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  const deleted = await knex('items').where({ id }).del();
  if (!deleted) {
    ctx.throw(404, 'Item not found');
  }
  ctx.body = `Item ${id} deleted successfully`;
});

app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
