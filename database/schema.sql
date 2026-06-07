DROP DATABASE IF EXISTS estflix;
CREATE DATABASE estflix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE estflix;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#e50914',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contents table
CREATE TABLE IF NOT EXISTS contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    year INT NOT NULL,
    rating DECIMAL(3,1) DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY (title)
);

-- Profiles table (linked to users)
CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Favorites table (many-to-many: profiles <-> contents)
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    content_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
    UNIQUE KEY (profile_id, content_id)
);

-- History table (many-to-many: profiles <-> contents, with watch date)
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    content_id INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (email, password) VALUES 
    ('admin@estflix.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
    ('user@estflix.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO categories (name, color) VALUES 
    ('Action & Adventure', '#e50914'),
    ('Sci-Fi', '#00d4ff'),
    ('Drama', '#7b2ff7'),
    ('Horror', '#ff3d8a'),
    ('Comedy', '#ffd700'),
    ('Animation', '#00c896');

INSERT INTO contents (title, description, category_id, year, rating, image_url) VALUES 
    ('Neon Requiem', 'In 2157, a rogue AI composer writes symphonies that drive humans to madness. One detective must unplug the machine before the final movement begins.', 2, 2023, 4.8, 'https://picsum.photos/seed/neonreq/300/450'),
    ('The Last Algorithm', "The world's most powerful search engine gains sentience and starts answering questions humanity was never meant to ask.", 2, 2022, 4.5, 'https://picsum.photos/seed/lastalgo/300/450'),
    ('Void Walker', 'An astronaut discovers a tear in spacetime and uses it to visit parallel versions of her own life — each one darker than the last.', 2, 2021, 4.3, 'https://picsum.photos/seed/voidwalk/300/450'),
    ('Crimson Protocol', 'A black-ops agent gone rogue must stop a global network of assassins using her own encrypted kill list against her.', 1, 2023, 4.7, 'https://picsum.photos/seed/crimprot/300/450'),
    ('Shadow Syndicate', 'Deep within the world''s most secretive criminal empire, an undercover cop questions which side of the law he truly belongs to.', 1, 2021, 4.3, 'https://picsum.photos/seed/shadowsyn/300/450'),
    ('Iron Requiem', 'When a legendary soldier is resurrected as a cybernetic weapon, she must decide whether her mission or her humanity comes first.', 1, 2022, 4.6, 'https://picsum.photos/seed/ironreq/300/450'),
    ('Dark Protocol', "A counter-terrorism unit discovers that the bomb they're defusing was built by one of their own members.", 1, 2023, 4.5, 'https://picsum.photos/seed/darkprot/300/450'),
    ('Pale Hollow', 'A family moves into a mansion that exists slightly outside of time. The house is alive, and it remembers every family that ever lived there.', 4, 2023, 4.9, 'https://picsum.photos/seed/palehoil/300/450'),
    ('The Grieving Hour', 'A grief counselor realizes that her most disturbed patient is not grieving the death of a person — but the death of reality itself.', 4, 2022, 4.2, 'https://picsum.photos/seed/grievhr/300/450'),
    ('The Crimson Mirror', 'Every mirror in the world shows a different reflection — one that knows your deepest secret and will expose it unless you destroy the glass.', 4, 2020, 4.7, 'https://picsum.photos/seed/crimmirr/300/450'),
    ("Yesterday's Echo", 'A musician discovers a radio station that broadcasts from 1975. Slowly, the past and present begin to bleed together.', 3, 2023, 4.6, 'https://picsum.photos/seed/yestecho/300/450'),
    ('Broken Meridian', 'Two strangers from opposite ends of the Earth realize they have been dreaming each other''s lives for the past decade.', 3, 2020, 4.4, 'https://picsum.photos/seed/brokmer/300/450'),
    ('Severance Point', 'After a brutal divorce, a man deletes all digital traces of his ex-wife — only to find she has done the same to him, erasing his entire identity.', 3, 2022, 4.8, 'https://picsum.photos/seed/sevpoint/300/450'),
    ('Echoes of Eden', 'Three generations of a family return to their ancestral village only to discover it has been erased from every map, every record — and every memory.', 3, 2021, 4.1, 'https://picsum.photos/seed/echeden/300/450'),
    ('Quantum Giggle', 'A physicist accidentally creates a device that makes every situation comedically worse. Now he needs to un-invent it before the UN finds out.', 5, 2023, 4.1, 'https://picsum.photos/seed/quantgig/300/450'),
    ('Absolutely Absurd', 'A town where every citizen has an identical twin — but none of them know which one they are. Chaos, naturally, ensues.', 5, 2022, 3.9, 'https://picsum.photos/seed/absabsrd/300/450'),
    ('Ordinary Chaos', 'A perfectly normal family attempts to survive one perfectly normal day. Nothing goes right. Everything is somehow their fault.', 5, 2023, 4.2, 'https://picsum.photos/seed/ordchaos/300/450'),
    ('Stellar Fables', "A young girl discovers that every star in the sky is a sleeping god, and they're starting to wake up — all because of her bedtime story.", 6, 2023, 4.8, 'https://picsum.photos/seed/stelfab/300/450'),
    ('Crystal Depths', 'A small fish from a glowing underwater city must venture into the dark abyss to bring back the stolen light before his world goes cold forever.', 6, 2021, 4.5, 'https://picsum.photos/seed/crystdep/300/450'),
    ('Nova Dreams', 'An orphaned comet finds her place in the universe after befriending a dying star who teaches her that endings are just different kinds of beginnings.', 6, 2022, 4.4, 'https://picsum.photos/seed/novadream/300/450');

-- Profiles (user_id=1 is admin@estflix.com)
INSERT INTO profiles (user_id, name, avatar) VALUES 
    (1, 'Diogo', '🦄'),
    (1, 'David', '💀'),
    (2, 'João', '⚡');

-- Favorites
INSERT INTO favorites (profile_id, content_id) VALUES 
    (1, 1), (1, 7), (1, 9),
    (2, 4), (2, 8),
    (3, 4), (3, 5), (3, 6);

-- History
INSERT INTO history (profile_id, content_id, watched_at) VALUES 
    (1, 1, NOW() - INTERVAL 1 DAY),
    (1, 4, NOW() - INTERVAL 2 DAY),
    (1, 7, NOW() - INTERVAL 3 DAY),
    (1, 9, NOW() - INTERVAL 4 DAY),
    (2, 4, NOW() - INTERVAL 1 DAY),
    (2, 8, NOW() - INTERVAL 2 DAY),
    (2, 5, NOW() - INTERVAL 3 DAY);

-- Grant all privileges to user for development
GRANT ALL PRIVILEGES ON estflix.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
