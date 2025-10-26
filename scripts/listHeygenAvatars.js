/**
 * HeyGen Avatar Listesi Çekme Script'i
 * 
 * Bu script, HeyGen API'den mevcut avatarları çeker ve konsola yazdırır.
 * 
 * Kullanım: node scripts/listHeygenAvatars.js
 */

const HEYGEN_API_KEY = "sk_V2_hgu_ktMj8J6thff_8ijTaBIMdsArKLExIljL4bFBCmsSlhXM";
const HEYGEN_API_BASE = "https://api.heygen.com";

async function listAvatars() {
  try {
    console.log("🔍 Fetching HeyGen avatars...\n");

    const response = await fetch(`${HEYGEN_API_BASE}/v2/avatars`, {
      method: "GET",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const avatars = data.data?.avatars || [];

    console.log(`✅ Found ${avatars.length} avatars:\n`);

    // Public avatarları filtrele ve göster
    const publicAvatars = avatars.filter(
      (avatar) => 
        avatar.avatar_id && 
        (avatar.is_public === true || avatar.avatar_id.includes('public'))
    );

    console.log("📋 PUBLIC AVATARS:");
    console.log("==================\n");

    publicAvatars.slice(0, 10).forEach((avatar, index) => {
      console.log(`${index + 1}. ${avatar.avatar_name || 'Unnamed'}`);
      console.log(`   ID: ${avatar.avatar_id}`);
      console.log(`   Gender: ${avatar.gender || 'N/A'}`);
      console.log(`   Preview: ${avatar.preview_image_url || 'N/A'}`);
      console.log(`   Public: ${avatar.is_public || false}`);
      console.log("");
    });

    // JavaScript config formatında çıktı
    console.log("\n📝 AVATARCONFIG.JS FORMATINDA:");
    console.log("================================\n");

    publicAvatars.slice(0, 5).forEach((avatar) => {
      const name = avatar.avatar_name || 'Unnamed';
      const id = avatar.avatar_id;
      const gender = avatar.gender || 'unknown';
      
      console.log(`{
  id: '${id.toLowerCase().replace(/[^a-z0-9]/g, '_')}',
  name: '${name}',
  gender: '${gender}',
  avatarId: '${id}',
  description: 'HeyGen - ${name}',
  online: true,
},`);
    });

    // Tüm avatarları JSON dosyasına kaydet
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(__dirname, 'heygen_avatars.json');
    fs.writeFileSync(outputPath, JSON.stringify(avatars, null, 2));
    
    console.log(`\n✅ Tüm avatar listesi şuraya kaydedildi: ${outputPath}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

listAvatars();

