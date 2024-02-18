"use server";

export async function getArticlesByClusterId(id: string) {
  return [{ article: "article1" }, { article: "article2" }];
}
