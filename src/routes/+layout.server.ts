import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ( { fetch} ) => {
  const res = await fetch('/api/me').then(res => res.json());
  
  return {
    cur_user: res.username || "Guest"
  };
};


// export async function logout() {
//   await fetch('/api/logout', {
//       method: 'POST',
//       credentials: 'include'
//   });
//   window.location.href = '/';
// }