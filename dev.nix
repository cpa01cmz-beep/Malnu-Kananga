{ pkgs, ... }: {
  # Beri tahu Nix paket mana yang akan digunakan
  packages = [
    pkgs.nodejs_20
  ];

  # Konfigurasikan proses pratinjau
  previews = {
    # Pratinjau default untuk port 3000
    default = {
      # Perintah untuk menjalankan server pengembangan Vite
      command = "npm run dev -- --host 0.0.0.0";
      port = 3000;
    };
  };
}
