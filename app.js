/* =====================================================
   DESIGNIA AI
   APPLICATION JAVASCRIPT
===================================================== */


/* =====================================================
   CONFIGURATION SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://ccxxylgyplmrifpdaeig.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_wHGieMuIRhyXYq4tDOliIg_D7pxnOMP";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =====================================================
   VARIABLES
===================================================== */

let currentUser = null;
let currentProduct = null;
let categories = [];


/* =====================================================
   ÉLÉMENTS HTML
===================================================== */

const authScreen =
  document.getElementById("authScreen");

const dashboard =
  document.getElementById("dashboard");

const authForm =
  document.getElementById("authForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const authButton =
  document.getElementById("authButton");

const authMessage =
  document.getElementById("authMessage");

const loginTab =
  document.getElementById("loginTab");

const signupTab =
  document.getElementById("signupTab");

const logoutButton =
  document.getElementById("logoutButton");

const newProductButton =
  document.getElementById("newProductButton");

const emptyNewProductButton =
  document.getElementById("emptyNewProductButton");

const productModal =
  document.getElementById("productModal");

const closeProductModal =
  document.getElementById("closeProductModal");

const cancelProductButton =
  document.getElementById("cancelProductButton");

const productForm =
  document.getElementById("productForm");

const productPhoto =
  document.getElementById("productPhoto");

const photoPreview =
  document.getElementById("photoPreview");

const productName =
  document.getElementById("productName");

const productCategory =
  document.getElementById("productCategory");

const productPrice =
  document.getElementById("productPrice");

const productDescription =
  document.getElementById("productDescription");

const productMessage =
  document.getElementById("productMessage");

const saveProductButton =
  document.getElementById("saveProductButton");

const productsGrid =
  document.getElementById("productsGrid");

const emptyProducts =
  document.getElementById("emptyProducts");

const detailModal =
  document.getElementById("detailModal");

const closeDetailModal =
  document.getElementById("closeDetailModal");

const detailContent =
  document.getElementById("detailContent");

const generationMessage =
  document.getElementById("generationMessage");


/* =====================================================
   MODE CONNEXION / INSCRIPTION
===================================================== */

let authMode = "login";


function setAuthMode(mode) {

  authMode = mode;

  if (mode === "login") {

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    authButton.textContent =
      "Se connecter";

  } else {

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    authButton.textContent =
      "Créer mon compte";

  }

  authMessage.textContent = "";

}


/* =====================================================
   CHANGEMENT D'ONGLET
===================================================== */

loginTab.addEventListener(
  "click",
  function() {

    setAuthMode("login");

  }
);


signupTab.addEventListener(
  "click",
  function() {

    setAuthMode("signup");

  }
);


/* =====================================================
   ÉCHAPPEMENT HTML
===================================================== */

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   AUTHENTIFICATION
===================================================== */

authForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;

    if (!email || !password) {

      authMessage.textContent =
        "Merci de remplir tous les champs.";

      return;

    }

    authButton.disabled = true;

    authMessage.textContent =
      authMode === "login"
        ? "Connexion en cours..."
        : "Création du compte...";


    try {

      if (authMode === "login") {

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signInWithPassword({
              email,
              password
            });


        if (error) {
          throw error;
        }

        currentUser =
          data.user;

        authMessage.textContent = "";

        await showDashboard();

      } else {

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signUp({
              email,
              password
            });


        if (error) {
          throw error;
        }


        if (data.session) {

          currentUser =
            data.user;

          authMessage.textContent = "";

          await showDashboard();

        } else {

          authMessage.textContent =
            "Compte créé ! Vérifie ton e-mail si une confirmation est demandée.";

        }

      }

    } catch (error) {

      console.error(error);

      authMessage.textContent =
        getFriendlyAuthError(error);

    } finally {

      authButton.disabled = false;

    }

  }
);


/* =====================================================
   MESSAGES D'ERREUR AUTHENTIFICATION
===================================================== */

function getFriendlyAuthError(error) {

  const message =
    error?.message || "";

  if (
    message.toLowerCase().includes(
      "invalid login credentials"
    )
  ) {

    return "E-mail ou mot de passe incorrect.";

  }

  if (
    message.toLowerCase().includes(
      "user already registered"
    )
  ) {

    return "Cette adresse e-mail possède déjà un compte.";

  }

  if (
    message.toLowerCase().includes(
      "password"
    )
  ) {

    return "Le mot de passe doit respecter les conditions demandées.";

  }

  return message ||
    "Une erreur est survenue. Réessaie.";

}


/* =====================================================
   DÉCONNEXION
===================================================== */

logoutButton.addEventListener(
  "click",
  async function() {

    await supabaseClient.auth.signOut();

    currentUser = null;

    showAuth();

  }
);


/* =====================================================
   AFFICHER L'ÉCRAN DE CONNEXION
===================================================== */

function showAuth() {

  authScreen.classList.remove("hidden");

  dashboard.classList.add("hidden");

}


/* =====================================================
   AFFICHER LE TABLEAU DE BORD
===================================================== */

async function showDashboard() {

  authScreen.classList.add("hidden");

  dashboard.classList.remove("hidden");

  await loadCategories();

  await loadProducts();

}


/* =====================================================
   VÉRIFIER LA SESSION
===================================================== */

async function checkSession() {

  const {
    data,
    error
  } =
    await supabaseClient.auth
      .getSession();


  if (error) {

    console.error(error);

    showAuth();

    return;

  }


  if (data.session) {

    currentUser =
      data.session.user;

    await showDashboard();

  } else {

    showAuth();

  }

}


/* =====================================================
   CHARGER LES CATÉGORIES
===================================================== */

async function loadCategories() {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("categories")
      .select("*")
      .order("name", {
        ascending: true
      });


  if (error) {

    console.error(
      "Erreur catégories :",
      error
    );

    return;

  }


  categories =
    data || [];

  productCategory.innerHTML =
    `<option value="">
      Choisir une catégorie
    </option>`;


  categories.forEach(
    function(category) {

      const option =
        document.createElement("option");

      option.value =
        category.id;

      option.textContent =
        category.name;

      productCategory.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   OUVRIR MODALE PRODUIT
===================================================== */

function openProductModal() {

  productModal.classList.remove(
    "hidden"
  );

  productForm.reset();

  productMessage.textContent = "";

  photoPreview.innerHTML = `
    <span>📷</span>
    <p>Sélectionne une photo</p>
  `;

}


/* =====================================================
   FERMER MODALE PRODUIT
===================================================== */

function closeProductCreationModal() {

  productModal.classList.add(
    "hidden"
  );

}


/* =====================================================
   BOUTONS NOUVEAU PRODUIT
===================================================== */

newProductButton.addEventListener(
  "click",
  openProductModal
);


emptyNewProductButton.addEventListener(
  "click",
  openProductModal
);


closeProductModal.addEventListener(
  "click",
  closeProductCreationModal
);


cancelProductButton.addEventListener(
  "click",
  closeProductCreationModal
);


/* =====================================================
   APERÇU PHOTO
===================================================== */

productPhoto.addEventListener(
  "change",
  function() {

    const file =
      productPhoto.files[0];

    if (!file) {

      photoPreview.innerHTML = `
        <span>📷</span>
        <p>Sélectionne une photo</p>
      `;

      return;

    }


    if (file.size > 10 * 1024 * 1024) {

      productPhoto.value = "";

      photoPreview.innerHTML = `
        <span>⚠️</span>
        <p>La photo dépasse 10 Mo.</p>
      `;

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      function(event) {

        photoPreview.innerHTML = `
          <img
            src="${event.target.result}"
            alt="Aperçu"
          >
        `;

      };


    reader.readAsDataURL(file);

  }
);


/* =====================================================
   CRÉATION PRODUIT
===================================================== */

productForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    if (!currentUser) {

      productMessage.textContent =
        "Ta session a expiré. Reconnecte-toi.";

      return;

    }


    const file =
      productPhoto.files[0];

    const name =
      productName.value.trim();

    const categoryId =
      productCategory.value || null;

    const price =
      productPrice.value
        ? Number(productPrice.value)
        : null;

    const description =
      productDescription.value.trim();


    if (!file) {

      productMessage.textContent =
        "Ajoute une photo du produit.";

      return;

    }


    if (!name) {

      productMessage.textContent =
        "Indique le nom du produit.";

      return;

    }


    saveProductButton.disabled = true;

    saveProductButton.textContent =
      "Création en cours...";

    productMessage.textContent =
      "Création du produit...";


    try {

      /* -----------------------------------------
         1. CRÉER LE PRODUIT
      ----------------------------------------- */

      const {
        data: product,
        error: productError
      } =
        await supabaseClient
          .from("products")
          .insert({
            user_id:
              currentUser.id,

            name,

            category_id:
              categoryId,

            price,

            description
          })
          .select()
          .single();


      if (productError) {
        throw productError;
      }


      /* -----------------------------------------
         2. PRÉPARER LE CHEMIN IMAGE
      ----------------------------------------- */

      const extension =
        getFileExtension(file.name);

      const filePath =
        `${currentUser.id}/${product.id}.${extension}`;


      /* -----------------------------------------
         3. TÉLÉVERSER L'IMAGE
      ----------------------------------------- */

      productMessage.textContent =
        "Téléversement de la photo...";


      const {
        error: uploadError
      } =
        await supabaseClient
          .storage
          .from("product-images")
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: true,
              contentType:
                file.type
            }
          );


      if (uploadError) {

        await supabaseClient
          .from("products")
          .delete()
          .eq("id", product.id);

        throw uploadError;

      }


      /* -----------------------------------------
         4. ENREGISTRER L'IMAGE
      ----------------------------------------- */

      const {
        error: imageError
      } =
        await supabaseClient
          .from("product_images")
          .insert({
            product_id:
              product.id,

            user_id:
              currentUser.id,

            image_url:
              filePath,

            image_type:
              "source"
          });


      if (imageError) {
        throw imageError;
      }


      /* -----------------------------------------
         5. ENREGISTRER LE CHEMIN DANS PRODUCT
      ----------------------------------------- */

      const {
        error: updateError
      } =
        await supabaseClient
          .from("products")
          .update({
            photo_url:
              filePath
          })
          .eq(
            "id",
            product.id
          );


      if (updateError) {
        throw updateError;
      }


      productMessage.textContent =
        "Produit créé avec succès ✨";


      await loadProducts();


      setTimeout(
        function() {

          closeProductCreationModal();

        },
        700
      );


    } catch (error) {

      console.error(
        "Erreur création produit :",
        error
      );

      productMessage.textContent =
        getFriendlyProductError(error);

    } finally {

      saveProductButton.disabled =
        false;

      saveProductButton.textContent =
        "Créer le produit";

    }

  }
);


/* =====================================================
   EXTENSION FICHIER
===================================================== */

function getFileExtension(filename) {

  const parts =
    filename.split(".");

  if (parts.length < 2) {
    return "jpg";
  }

  return parts[
    parts.length - 1
  ]
    .toLowerCase();

}


/* =====================================================
   ERREURS PRODUIT
===================================================== */

function getFriendlyProductError(error) {

  const message =
    error?.message || "";

  if (
    message.toLowerCase().includes(
      "payload too large"
    )
  ) {

    return "La photo est trop volumineuse.";

  }

  if (
    message.toLowerCase().includes(
      "duplicate"
    )
  ) {

    return "Ce fichier existe déjà.";

  }

  return message ||
    "Impossible de créer le produit.";

}


/* =====================================================
   CHARGER LES PRODUITS
===================================================== */

async function loadProducts() {

  if (!currentUser) {
    return;
  }


  productsGrid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⏳</div>
      <p>Chargement des produits...</p>
    </div>
  `;


  const {
    data,
    error
  } =
    await supabaseClient
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq(
        "user_id",
        currentUser.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


 
