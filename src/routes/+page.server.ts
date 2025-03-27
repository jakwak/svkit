import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const users = await fetch('/api/users').then((res) => res.json());
  return {
    users,
  };
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		console.log("form data: ", data);    
	}
};