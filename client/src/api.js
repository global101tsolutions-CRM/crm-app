
export async function api(path, opts={}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error((await res.json()).error?.message || res.statusText);
  return (await res.json()).data;
}
