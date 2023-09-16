import { PrismaClient } from "@prisma/client";
import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger"

const setup = (app: Elysia) => app.decorate("db", new PrismaClient());

const app = new Elysia()
  .use(swagger({
    path: "/v1/swagger"
  }))
  .use(setup)
  .group("/search", (app) => {
    return app
      .get("/", async ({ db }) => await db.movie.findMany())
      .guard(
        {
          query: t.Object({
            q: t.String(),
          }),
        },
        (app) => {
          return (
            app
              .get(
                "/movie",
                async ({ query, db }) =>
                  await db.movie.findMany({
                    where: { title: { contains: query.q } },
                  })
              )
              .get(
                "/tv",
                async ({ query, db }) =>
                  await db.movie.findMany({
                    where: { title: { contains: query.q }, type: "series" },
                  })
              )
              .get(
                "/person",
                async ({ query, db }) =>
                  await db.person.findMany({
                    where: { name: { contains: query.q } },
                  })
              )
              // .get("/company", async ({ query, db }) =>
              // db.movie.await findMany({ where: { title: { contains: query.q } } })
              // )
              .get(
                "/episode",
                async ({ query, db }) =>
                  await db.episode.findMany({
                    where: { title: { contains: query.q } },
                  })
              )
              .get(
                "/review",
                async ({ query, db }) =>
                  await db.review.findMany({
                    where: { comment: { contains: query.q } },
                  })
              )
              .get(
                "/award",
                async ({ query, db }) =>
                  await db.award.findMany({
                    where: { name: { contains: query.q } },
                  })
              )
          );
        }
      );
  })

  .group("/title/:id", (app) => {
    return app
      .get(
        "/",
        async ({ params, db }) =>
          await db.movie.findUnique({
            where: {
              id: parseInt(params.id, 10),
            },
          })
      )
      .get(
        "/episodes",
        async ({ params, db }) =>
          await db.episode.findMany({
            where: {
              movieId: parseInt(params.id, 10),
            },
          })
      )
      .get(
        "/cast",
        async ({ params, db }) =>
          await db.person.findMany({
            where: {
              movies: {
                some: {
                  id: parseInt(params.id, 10),
                },
              },
            },
          })
      )
      .get(
        "/reviews",
        async ({ params, db }) =>
          await db.review.findMany({
            where: {
              movieId: parseInt(params.id, 10),
            },
          })
      )
      .get(
        "/awards",
        async ({ params, db }) =>
          await db.award.findMany({
            where: {
              movieId: parseInt(params.id, 10),
            },
          })
      );
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
