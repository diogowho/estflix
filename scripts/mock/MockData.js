class MockData {
	static seed(contentService, categoryService, profileService) {
		if (StorageService.get('estflix_seeded')) return;

		const categories = [
			{
				id: 'cat_action',
				name: 'Action & Adventure',
				color: '#e50914',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cat_scifi',
				name: 'Sci-Fi',
				color: '#00d4ff',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cat_drama',
				name: 'Drama',
				color: '#7b2ff7',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cat_horror',
				name: 'Horror',
				color: '#ff3d8a',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cat_comedy',
				name: 'Comedy',
				color: '#ffd700',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cat_animation',
				name: 'Animation',
				color: '#00c896',
				createdAt: new Date().toISOString(),
			},
		];

		const contents = [
			{
				id: 'cnt_1',
				title: 'Neon Requiem',
				description:
					'In 2157, a rogue AI composer writes symphonies that drive humans to madness. One detective must unplug the machine before the final movement begins.',
				categoryId: 'cat_scifi',
				year: 2023,
				rating: 4.8,
				imageUrl: 'https://picsum.photos/seed/neonreq/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_2',
				title: 'The Last Algorithm',
				description:
					"The world's most powerful search engine gains sentience and starts answering questions humanity was never meant to ask.",
				categoryId: 'cat_scifi',
				year: 2022,
				rating: 4.5,
				imageUrl: 'https://picsum.photos/seed/lastalgo/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_3',
				title: 'Void Walker',
				description:
					'An astronaut discovers a tear in spacetime and uses it to visit parallel versions of her own life — each one darker than the last.',
				categoryId: 'cat_scifi',
				year: 2021,
				rating: 4.3,
				imageUrl: 'https://picsum.photos/seed/voidwalk/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_4',
				title: 'Crimson Protocol',
				description:
					'A black-ops agent gone rogue must stop a global network of assassins using her own encrypted kill list against her.',
				categoryId: 'cat_action',
				year: 2023,
				rating: 4.7,
				imageUrl: 'https://picsum.photos/seed/crimprot/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_5',
				title: 'Shadow Syndicate',
				description:
					"Deep within the world's most secretive criminal empire, an undercover cop questions which side of the law he truly belongs to.",
				categoryId: 'cat_action',
				year: 2021,
				rating: 4.3,
				imageUrl: 'https://picsum.photos/seed/shadowsyn/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_6',
				title: 'Iron Requiem',
				description:
					'When a legendary soldier is resurrected as a cybernetic weapon, she must decide whether her mission or her humanity comes first.',
				categoryId: 'cat_action',
				year: 2022,
				rating: 4.6,
				imageUrl: 'https://picsum.photos/seed/ironreq/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_7',
				title: 'Dark Protocol',
				description:
					"A counter-terrorism unit discovers that the bomb they're defusing was built by one of their own members.",
				categoryId: 'cat_action',
				year: 2023,
				rating: 4.5,
				imageUrl: 'https://picsum.photos/seed/darkprot/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_8',
				title: 'Pale Hollow',
				description:
					'A family moves into a mansion that exists slightly outside of time. The house is alive, and it remembers every family that ever lived there.',
				categoryId: 'cat_horror',
				year: 2023,
				rating: 4.9,
				imageUrl: 'https://picsum.photos/seed/palehoil/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_9',
				title: 'The Grieving Hour',
				description:
					'A grief counselor realizes that her most disturbed patient is not grieving the death of a person — but the death of reality itself.',
				categoryId: 'cat_horror',
				year: 2022,
				rating: 4.2,
				imageUrl: 'https://picsum.photos/seed/grievhr/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_10',
				title: 'The Crimson Mirror',
				description:
					'Every mirror in the world shows a different reflection — one that knows your deepest secret and will expose it unless you destroy the glass.',
				categoryId: 'cat_horror',
				year: 2020,
				rating: 4.7,
				imageUrl: 'https://picsum.photos/seed/crimmirr/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_11',
				title: "Yesterday's Echo",
				description:
					'A musician discovers a radio station that broadcasts from 1975. Slowly, the past and present begin to bleed together.',
				categoryId: 'cat_drama',
				year: 2023,
				rating: 4.6,
				imageUrl: 'https://picsum.photos/seed/yestecho/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_12',
				title: 'Broken Meridian',
				description:
					"Two strangers from opposite ends of the Earth realize they have been dreaming each other's lives for the past decade.",
				categoryId: 'cat_drama',
				year: 2020,
				rating: 4.4,
				imageUrl: 'https://picsum.photos/seed/brokmer/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_13',
				title: 'Severance Point',
				description:
					'After a brutal divorce, a man deletes all digital traces of his ex-wife — only to find she has done the same to him, erasing his entire identity.',
				categoryId: 'cat_drama',
				year: 2022,
				rating: 4.8,
				imageUrl: 'https://picsum.photos/seed/sevpoint/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_14',
				title: 'Echoes of Eden',
				description:
					'Three generations of a family return to their ancestral village only to discover it has been erased from every map, every record — and every memory.',
				categoryId: 'cat_drama',
				year: 2021,
				rating: 4.1,
				imageUrl: 'https://picsum.photos/seed/echeden/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_15',
				title: 'Quantum Giggle',
				description:
					'A physicist accidentally creates a device that makes every situation comedically worse. Now he needs to un-invent it before the UN finds out.',
				categoryId: 'cat_comedy',
				year: 2023,
				rating: 4.1,
				imageUrl: 'https://picsum.photos/seed/quantgig/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_16',
				title: 'Absolutely Absurd',
				description:
					'A town where every citizen has an identical twin — but none of them know which one they are. Chaos, naturally, ensues.',
				categoryId: 'cat_comedy',
				year: 2022,
				rating: 3.9,
				imageUrl: 'https://picsum.photos/seed/absabsrd/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_17',
				title: 'Ordinary Chaos',
				description:
					'A perfectly normal family attempts to survive one perfectly normal day. Nothing goes right. Everything is somehow their fault.',
				categoryId: 'cat_comedy',
				year: 2023,
				rating: 4.2,
				imageUrl: 'https://picsum.photos/seed/ordchaos/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_18',
				title: 'Stellar Fables',
				description:
					"A young girl discovers that every star in the sky is a sleeping god, and they're starting to wake up — all because of her bedtime story.",
				categoryId: 'cat_animation',
				year: 2023,
				rating: 4.8,
				imageUrl: 'https://picsum.photos/seed/stelfab/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_19',
				title: 'Crystal Depths',
				description:
					'A small fish from a glowing underwater city must venture into the dark abyss to bring back the stolen light before his world goes cold forever.',
				categoryId: 'cat_animation',
				year: 2021,
				rating: 4.5,
				imageUrl: 'https://picsum.photos/seed/crystdep/300/450',
				createdAt: new Date().toISOString(),
			},
			{
				id: 'cnt_20',
				title: 'Nova Dreams',
				description:
					'An orphaned comet finds her place in the universe after befriending a dying star who teaches her that endings are just different kinds of beginnings.',
				categoryId: 'cat_animation',
				year: 2022,
				rating: 4.4,
				imageUrl: 'https://picsum.photos/seed/novadream/300/450',
				createdAt: new Date().toISOString(),
			},
		];

		const profiles = [
			{
				id: 'prof_diogo',
				name: 'Diogo',
				avatar: '🦄',
				favorites: ['cnt_1', 'cnt_8', 'cnt_13'],
				history: ['cnt_1', 'cnt_4', 'cnt_8', 'cnt_11'],
				createdAt: new Date().toISOString(),
			},
			{
				id: 'prof_david',
				name: 'David',
				avatar: '💀',
				favorites: ['cnt_4', 'cnt_10'],
				history: ['cnt_4', 'cnt_10', 'cnt_5'],
				createdAt: new Date().toISOString(),
			},
			{
				id: 'prof_joao',
				name: 'João',
				avatar: '⚡',
				favorites: ['cnt_18', 'cnt_19', 'cnt_20'],
				history: ['cnt_18', 'cnt_19', 'cnt_20', 'cnt_15'],
				createdAt: new Date().toISOString(),
			},
		];

		StorageService.set('estflix_categories', categories);
		StorageService.set('estflix_contents', contents);
		StorageService.set('estflix_profiles', profiles);
		StorageService.set('estflix_active_profile', 'prof_nova');
		StorageService.set('estflix_seeded', true);
	}
}
