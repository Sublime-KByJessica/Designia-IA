const SUPABASE_URL = "https://ccxxylgyplmrifpdaeig.supabase.co";
const SUPABASE_KEY = "sb_publishable_wHGieMuIRhyXYq4tDOliIg_D7pxnOMP";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentUser = null;
let currentProduct = null;
let categories = [];
let authMode = "login";


/* =====================================================
   ÉLÉMENTS
===================================================== */

const authScreen = document.getElementById("authScreen");
const dashboard = document.getElementById("dashboard");

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const authButton = document.getElementById("authButton");
const authMessage = document.getElementById("authMessage");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const logoutButton = document.getElementById("logoutButton");

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
   CONNEXION / INSCRIPTION
===================================================== */

function setAuthMode(mode) {

  authMode = mode;

  loginTab.classList.toggle(
    "active",
    mode === "login"
  );

  signupTab.classList.toggle(
    "active",
    mode === "signup"
  );

  authButton.textContent =
    mode === "login"
      ? "Se connecter"
      : "Créer mon compte";

  authMessage.textContent = "";
}


loginTab.addEventListener(
  "click",
  function () {
    setAuthMode("login");
  }
);


signupTab.addEventListener(
  "click",
  function () {
    setAuthMode("signup");
  }
);


/* =====================================================
   ÉCHAPPEMENT HTML
===================================================== */

function escapeHtml(value) {

  return String(value ?? "")
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
  async function (event) {

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
          await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
          });

        if (error) {
          throw error;
        }

        currentUser = data.user;

        await showDashboard();

      } else {

        const {
          data,
          error
        } =
          await supabaseClient.auth.signUp({
            email: email,
            password: password
          });

        if (error) {
          throw error;
        }

        if (data.session) {

          currentUser = data.user;

          await showDashboard();

        } else {

          authMessage.textContent =
            "Compte créé ! Vérifie ton e-mail si une confirmation est demandée.";
        }
      }

    } catch (error) {

      console.error(error);

      authMessage.textContent =
        getAuthErrorMessage(error);

    } finally {

      authButton.disabled = false;
    }
  }
);


/* =====================================================
   ERREURS CONNEXION
===================================================== */

function getAuthErrorMessage(error) {

  const message =
    error?.message || "";

  const lower =
    message.toLowerCase();

  if (
    lower.includes("invalid login credentials")
  ) {

    return "E-mail ou mot de passe incorrect.";
  }

  if (
    lower.includes("user already registered")
  ) {

    return "Cette adresse e-mail possède déjà un compte.";
  }

  if (
    lower.includes("password")
  ) {

    return "Le mot de passe doit respecter les conditions demandées.";
  }

  return (
    message ||
    "Une erreur est survenue. Réessaie."
  );
}


/* =====================================================
   AFFICHAGE
===================================================== */

function showAuth() {

  authScreen.classList.remove("hidden");

  dashboard.classList.add("hidden");
}


async function showDashboard() {

  authScreen.classList.add("hidden");

  dashboard.classList.remove("hidden");

  await loadCategories();

  await loadProducts();
}


/* =====================================================
   SESSION
===================================================== */

async function checkSession() {

  const {
    data,
    error
  } =
    await supabaseClient.auth.getSession();

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
   DÉCONNEXION
===================================================== */

logoutButton.addEventListener(
  "click",
  async function () {

    await supabaseClient.auth.signOut();

    currentUser = null;

    showAuth();
  }
);


/* =====================================================
   CATÉGORIES
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
    '<option value="">Choisir une catégorie</option>';

  categories.forEach(
    function (category) {

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
   MODALE PRODUIT
===================================================== */

function openProductModal() {

  productModal.classList.remove("hidden");

  productForm.reset();

  productMessage.textContent = "";

  photoPreview.innerHTML =
    "<span>📷</span><p>Sélectionne une photo</p>";
}


function closeProductCreationModal() {

  productModal.classList.add("hidden");
}


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
  function () {

    const file =
      productPhoto.files[0];

    if (!file) {

      photoPreview.innerHTML =
        "<span>📷</span><p>Sélectionne une photo</p>";

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      productPhoto.value = "";

      photoPreview.innerHTML =
        "<span>⚠️</span><p>La photo dépasse 10 Mo.</p>";

      return;
    }

    const reader =
      new FileReader();

    reader.onload =
      function (event) {

        photoPreview.innerHTML =
          '<img src="' +
          event.target.result +
          '" alt="Aperçu">';

      };

    reader.readAsDataURL(file);
  }
);


/* =====================================================
   EXTENSION PHOTO
===================================================== */

function getFileExtension(filename) {

  const parts =
    filename.split(".");

  if (parts.length < 2) {
    return "jpg";
  }

  return parts[
    parts.length - 1
  ].toLowerCase();
}


/* =====================================================
   CRÉER UN PRODUIT
===================================================== */

productForm.addEventListener(
  "submit",
  async function (event) {

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


    const priceText =
  productPrice.value
    .trim()
    .replace(",", ".");

const price =
  priceText !== ""
    ? Number(priceText)
    : null;
    
    if (
  price !== null &&
  (!Number.isFinite(price) || price < 0)
) {

  productMessage.textContent =
    "Indique un prix valide, par exemple 4,90 €.";

  return;
}

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


    saveProductButton.disabled =
      true;

    saveProductButton.textContent =
      "Création en cours...";


    try {

      productMessage.textContent =
        "Création du produit...";


      const {
        data: product,
        error: productError
      } =
        await supabaseClient
          .from("products")
          .insert({

            user_id:
              currentUser.id,

            name:
              name,

            category_id:
              categoryId,

            price:
              price,

            description:
              description

          })
          .select()
          .single();


      if (productError) {
        throw productError;
      }


      const extension =
        getFileExtension(
          file.name
        );


      const filePath =
        currentUser.id +
        "/" +
        product.id +
        "." +
        extension;


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
          .eq(
            "id",
            product.id
          );

        throw uploadError;
      }


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
        function () {

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
        error?.message ||
        "Impossible de créer le produit.";


    } finally {

      saveProductButton.disabled =
        false;

      saveProductButton.textContent =
        "Créer le produit";
    }
  }
);


/* =====================================================
   URL SIGNÉE PHOTO PRIVÉE
===================================================== */

async function getSignedImageUrl(path) {

  if (!path) {
    return null;
  }

  const {
    data,
    error
  } =
    await supabaseClient
      .storage
      .from("product-images")
      .createSignedUrl(
        path,
        3600
      );


  if (error) {

    console.error(
      "Erreur image :",
      error
    );

    return null;
  }


  return data?.signedUrl || null;
}


/* =====================================================
   CHARGER LES PRODUITS
===================================================== */

async function loadProducts() {

  if (!currentUser) {
    return;
  }


  productsGrid.innerHTML =
    '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement des produits...</p></div>';


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


  if (error) {

    console.error(
      "Erreur produits :",
      error
    );

    productsGrid.innerHTML =
      '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Impossible de charger les produits.</p></div>';

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    productsGrid.innerHTML = "";

    emptyProducts.classList.remove(
      "hidden"
    );

    return;
  }


  emptyProducts.classList.add(
    "hidden"
  );

  productsGrid.innerHTML = "";


  for (
    const product of data
  ) {

    const imageUrl =
      await getSignedImageUrl(
        product.photo_url
      );


    const categoryName =
      product.categories?.name ||
      "Sans catégorie";


    const price =
      product.price !== null &&
      product.price !== undefined
        ? Number(
            product.price
          ).toFixed(2) + " €"
        : "Prix non défini";


    const card =
      document.createElement(
        "article"
      );

    card.className =
      "product-card";


    let imageHtml = "";

    if (imageUrl) {

      imageHtml =
        '<img class="product-image" src="' +
        imageUrl +
        '" alt="' +
        escapeHtml(
          product.name
        ) +
        '">';

    } else {

      imageHtml =
        '<div class="product-image" style="display:flex;align-items:center;justify-content:center;font-size:45px">📦</div>';
    }


    card.innerHTML =
      imageHtml +

      '<div class="product-card-content">' +

      '<h3>' +
      escapeHtml(
        product.name
      ) +
      '</h3>' +

      '<p class="product-category">' +
      escapeHtml(
        categoryName
      ) +
      '</p>' +

      '<p class="product-price">' +
      price +
      '</p>' +

      '<button class="primary-button">' +
      "Ouvrir" +
      "</button>" +

      "</div>";


    card
      .querySelector("button")
      .addEventListener(
        "click",
        function () {

          openProductDetail(
            product
          );

        }
      );


    productsGrid.appendChild(
      card
    );
  }
}


/* =====================================================
   DÉTAIL PRODUIT
===================================================== */

async function openProductDetail(
  product
) {

  currentProduct =
    product;

  detailModal.classList.remove(
    "hidden"
  );

  generationMessage.textContent =
    "";

  detailContent.innerHTML =
    '<div class="empty-state"><div class="empty-icon">⏳</div><p>Chargement...</p></div>';


  const imageUrl =
    await getSignedImageUrl(
      product.photo_url
    );


  const categoryName =
    product.categories?.name ||
    "Sans catégorie";


  const price =
    product.price !== null &&
    product.price !== undefined
      ? Number(
          product.price
        ).toFixed(2) + " €"
      : "Prix non défini";


  let imageHtml = "";

  if (imageUrl) {

    imageHtml =
      '<img class="detail-product-image" src="' +
      imageUrl +
      '" alt="' +
      escapeHtml(
        product.name
      ) +
      '">';

  } else {

    imageHtml =
      '<div class="detail-product-image" style="min-height:250px;display:flex;align-items:center;justify-content:center;font-size:70px">📦</div>';
  }


  detailContent.innerHTML =
    '<div class="detail-product">' +

    imageHtml +

    '<div class="detail-product-info">' +

    '<p class="product-category">' +
    escapeHtml(
      categoryName
    ) +
    '</p>' +

    '<h2>' +
    escapeHtml(
      product.name
    ) +
    '</h2>' +

    '<p class="detail-price">' +
    price +
    '</p>' +

    '<p>' +
    escapeHtml(
      product.description ||
      "Aucune description."
    ) +
    '</p>' +

    '</div>' +

    '</div>';
}


/* =====================================================
   FERMER DÉTAIL
===================================================== */

closeDetailModal.addEventListener(
  "click",
  function () {

    detailModal.classList.add(
      "hidden"
    );

    currentProduct = null;
  }
);


/* =====================================================
   OUTILS DE GÉNÉRATION
===================================================== */

document
  .querySelectorAll(
    ".tool-button"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        async function () {

          if (!currentProduct) {

            generationMessage.textContent =
              "Aucun produit sélectionné.";

            return;
          }


          const type =
            button.dataset.generation;


          const labels = {

            mockup:
              "Générer un mockup",

            fiche:
              "Créer une fiche produit",

            promotion:
              "Créer une fiche promotionnelle",

            presentation:
              "Créer une présentation"

          };


          button.disabled = true;


          generationMessage.textContent =
            "Préparation du visuel...";


          try {

            const {
              error
            } =
              await supabaseClient
                .from(
                  "design_generations"
                )
                .insert({

                  product_id:
                    currentProduct.id,

                  user_id:
                    currentUser.id,

                  generation_type:
                    type,

                  prompt:
                    labels[type] ||
                    "Créer un visuel",

                  result_url:
                    null

                });


            if (error) {
              throw error;
            }


            generationMessage.textContent =
              (
                labels[type] ||
                "Visuel"
              ) +
              " enregistré ✨";


          } catch (error) {

            console.error(
              error
            );

            generationMessage.textContent =
              "Une erreur est survenue.";


          } finally {

            button.disabled =
              false;
          }
        }
      );
    }
  );


/* =====================================================
   FERMETURE EN CLIQUANT À L'EXTÉRIEUR
===================================================== */

productModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      productModal
    ) {

      closeProductCreationModal();
    }
  }
);


detailModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target ===
      detailModal
    ) {

      detailModal.classList.add(
        "hidden"
      );

      currentProduct = null;
    }
  }
);


/* =====================================================
   SESSION SUPABASE
===================================================== */

supabaseClient.auth.onAuthStateChange(
  function (event, session) {

    if (
      event === "SIGNED_IN" &&
      session
    ) {

      currentUser =
        session.user;
    }


    if (
      event === "SIGNED_OUT"
    ) {

      currentUser = null;

      showAuth();
    }
  }
);


/* =====================================================
   DÉMARRAGE
===================================================== */

checkSession();
