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
let editingProduct = null;
let selectedGenerationType = null;


/* =====================================================
   ÉLÉMENTS
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
  document.getElementById(
    "emptyNewProductButton"
  );

const productModal =
  document.getElementById(
    "productModal"
  );

const closeProductModal =
  document.getElementById(
    "closeProductModal"
  );

const cancelProductButton =
  document.getElementById(
    "cancelProductButton"
  );

const productForm =
  document.getElementById(
    "productForm"
  );

const productPhoto =
  document.getElementById(
    "productPhoto"
  );

const photoPreview =
  document.getElementById(
    "photoPreview"
  );

const productName =
  document.getElementById(
    "productName"
  );

const productCategory =
  document.getElementById(
    "productCategory"
  );

const productPrice =
  document.getElementById(
    "productPrice"
  );

const productDescription =
  document.getElementById(
    "productDescription"
  );

const productMessage =
  document.getElementById(
    "productMessage"
  );

const saveProductButton =
  document.getElementById(
    "saveProductButton"
  );

const productsGrid =
  document.getElementById(
    "productsGrid"
  );

const emptyProducts =
  document.getElementById(
    "emptyProducts"
  );

const detailModal =
  document.getElementById(
    "detailModal"
  );

const closeDetailModal =
  document.getElementById(
    "closeDetailModal"
  );

const detailContent =
  document.getElementById(
    "detailContent"
  );

const generationMessage =
  document.getElementById(
    "generationMessage"
  );


/* =====================================================
   ÉLÉMENTS ÉDITION IA
===================================================== */

const aiEditorPanel =
  document.getElementById(
    "aiEditorPanel"
  );

const aiEditorTitle =
  document.getElementById(
    "aiEditorTitle"
  );

const aiEditorSubtitle =
  document.getElementById(
    "aiEditorSubtitle"
  );

const aiStyle =
  document.getElementById(
    "aiStyle"
  );

const aiFormat =
  document.getElementById(
    "aiFormat"
  );

const aiInstructions =
  document.getElementById(
    "aiInstructions"
  );

const prepareAiGeneration =
  document.getElementById(
    "prepareAiGeneration"
  );

const closeAiEditor =
  document.getElementById(
    "closeAiEditor"
  );

const closeAiEditorBottom =
  document.getElementById(
    "closeAiEditorBottom"
  );

const aiGenerationPreview =
  document.getElementById(
    "aiGenerationPreview"
  );

const generationHistory =
  document.getElementById(
    "generationHistory"
  );

/* =====================================================
   ÉLÉMENTS APERÇU PERSONNALISATION
===================================================== */

const openPersonalizationButton =
  document.getElementById(
    "openPersonalizationButton"
  );

const personalizationPanel =
  document.getElementById(
    "personalizationPanel"
  );

const closePersonalization =
  document.getElementById(
    "closePersonalization"
  );

const personalizationPreview =
  document.getElementById(
    "personalizationPreview"
  );

const personalizationText =
  document.getElementById(
    "personalizationText"
  );

const personalizationColor =
  document.getElementById(
    "personalizationColor"
  );

const personalizationFont =
  document.getElementById(
    "personalizationFont"
  );

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
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
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
          await supabaseClient.auth
            .signInWithPassword({
              email: email,
              password: password
            });

        if (error) {
          throw error;
        }

        currentUser =
          data.user;

        await showDashboard();

      } else {

        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signUp({
              email: email,
              password: password
            });

        if (error) {
          throw error;
        }

        if (data.session) {

          currentUser =
            data.user;

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

      authButton.disabled =
        false;

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
    lower.includes(
      "invalid login credentials"
    )
  ) {

    return "E-mail ou mot de passe incorrect.";
  }

  if (
    lower.includes(
      "user already registered"
    )
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

  authScreen.classList.remove(
    "hidden"
  );

  dashboard.classList.add(
    "hidden"
  );
}


async function showDashboard() {

  authScreen.classList.add(
    "hidden"
  );

  dashboard.classList.remove(
    "hidden"
  );

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
   DÉCONNEXION
===================================================== */

logoutButton.addEventListener(
  "click",
  async function () {

    await supabaseClient.auth
      .signOut();

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
      .order(
        "name",
        {
          ascending: true
        }
      );

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
        document.createElement(
          "option"
        );

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

function openProductModal(
  product = null
) {

  productModal.classList.remove(
    "hidden"
  );

  productForm.reset();

  productMessage.textContent =
    "";

  editingProduct =
    product;

  productPhoto.required =
    !product;


  if (product) {

    productModal
      .querySelector("h2")
      .textContent =
        "Modifier le produit";

    saveProductButton.textContent =
      "Enregistrer les modifications";

    productName.value =
      product.name || "";

    productCategory.value =
      product.category_id || "";

    productPrice.value =
      product.price !== null &&
      product.price !== undefined
        ? Number(
            product.price
          )
            .toFixed(2)
            .replace(
              ".",
              ","
            )
        : "";

    productDescription.value =
      product.description || "";

    photoPreview.innerHTML =
      "<span>📷</span>" +
      "<p>Photo actuelle conservée</p>";

  } else {

    productModal
      .querySelector("h2")
      .textContent =
        "Créer un produit";

    saveProductButton.textContent =
      "Créer le produit";

    photoPreview.innerHTML =
      "<span>📷</span>" +
      "<p>Sélectionne une photo</p>";

  }
}


function closeProductCreationModal() {

  productModal.classList.add(
    "hidden"
  );

  editingProduct =
    null;

  productPhoto.required =
    true;
}


newProductButton.addEventListener(
  "click",
  function () {

    openProductModal();

  }
);


emptyNewProductButton.addEventListener(
  "click",
  function () {

    openProductModal();

  }
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
        "<span>📷</span>" +
        "<p>Sélectionne une photo</p>";

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {

      productPhoto.value =
        "";

      photoPreview.innerHTML =
        "<span>⚠️</span>" +
        "<p>La photo dépasse 10 Mo.</p>";

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

function getFileExtension(
  filename
) {

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
   CRÉER / MODIFIER UN PRODUIT
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
      productCategory.value ||
      null;

    const priceText =
      productPrice.value
        .trim()
        .replace(
          ",",
          "."
        );

    const price =
      priceText !== ""
        ? Number(priceText)
        : null;


    if (
      price !== null &&
      (
        !Number.isFinite(price) ||
        price < 0
      )
    ) {

      productMessage.textContent =
        "Indique un prix valide, par exemple 4,90 €.";

      return;
    }


    /* =========================
       MODIFICATION
    ========================== */

    if (editingProduct) {

      saveProductButton.disabled =
        true;

      saveProductButton.textContent =
        "Modification en cours...";

      try {

        /*
         * PHOTO
         * Si une nouvelle photo est sélectionnée,
         * on la téléverse avec un nouveau nom.
         *
         * Le nouveau nom évite également les problèmes
         * de cache du navigateur.
         */

        let newPhotoPath =
          editingProduct.photo_url || null;


        if (file) {

          const extension =
            getFileExtension(
              file.name
            );


          const filePath =
            currentUser.id +
            "/" +
            editingProduct.id +
            "-" +
            Date.now() +
            "." +
            extension;


          productMessage.textContent =
            "Téléversement de la nouvelle photo...";


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
                  cacheControl:
                    "3600",

                  upsert:
                    false,

                  contentType:
                    file.type
                }
              );


          if (uploadError) {
            throw uploadError;
          }


          newPhotoPath =
            filePath;


          /*
           * Enregistrer la nouvelle photo
           * dans la bibliothèque des images du produit.
           */

          const {
            error: imageError
          } =
            await supabaseClient
              .from("product_images")
              .insert({

                product_id:
                  editingProduct.id,

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

        }


        /*
         * Préparation des données à enregistrer.
         */

        productMessage.textContent =
          "Enregistrement des modifications...";


        const updateData = {

          name:
            name,

          category_id:
            categoryId,

          price:
            price,

          description:
            productDescription
              .value
              .trim()

        };


        /*
         * IMPORTANT :
         * photo_url n'est modifié que si
         * une nouvelle photo a réellement été choisie.
         */

        if (file) {

          updateData.photo_url =
            newPhotoPath;

        }


        /*
         * Mise à jour du produit.
         */

        const {
          data: updatedProduct,
          error
        } =
          await supabaseClient
            .from("products")
            .update(
              updateData
            )
            .eq(
              "id",
              editingProduct.id
            )
            .eq(
              "user_id",
              currentUser.id
            )
            .select()
            .single();


        if (error) {
          throw error;
        }


        /*
         * Si le produit était déjà ouvert,
         * on met également à jour le produit
         * actuellement utilisé par Designia.
         */

        if (
          currentProduct &&
          currentProduct.id ===
            editingProduct.id
        ) {

          currentProduct =
            {
              ...currentProduct,
              ...updatedProduct
            };

        }


        productMessage.textContent =
          file
            ? "Produit et photo modifiés avec succès ✨"
            : "Produit modifié avec succès ✨";


        editingProduct =
          null;


        /*
         * Recharge la liste des produits.
         */

        await loadProducts();


        /*
         * Si le détail du produit était ouvert,
         * on le recharge également avec la nouvelle photo.
         */

        if (
          currentProduct &&
          currentProduct.id ===
            updatedProduct.id &&
          !detailModal.classList.contains(
            "hidden"
          )
        ) {

          await openProductDetail(
            updatedProduct
          );

        }


        /*
         * Fermer la fenêtre de modification.
         */

        setTimeout(
          function () {

            closeProductCreationModal();

          },
          700
        );


      } catch (error) {

        console.error(
          "Erreur modification produit :",
          error
        );


        productMessage.textContent =
          error?.message ||
          "Impossible de modifier le produit.";


      } finally {

        saveProductButton.disabled =
          false;

        saveProductButton.textContent =
          "Enregistrer les modifications";

      }


      return;
    }

    /* =========================
       CRÉATION
    ========================== */

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
  data: {
    user
  },
  error: sessionError
} =
  await supabaseClient.auth.getUser();

if (
  sessionError ||
  !user
) {

  throw new Error(
    "Ta session a expiré. Reconnecte-toi avant de créer un produit."
  );

}

currentUser =
  user;


const {
  data: product,
  error: productError
} =
  await supabaseClient
    .from("products")
    .insert({

      user_id:
        user.id,

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
              cacheControl:
                "3600",

              upsert:
                true,

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

async function getSignedImageUrl(
  path
) {

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


  return data?.signedUrl ||
    null;
}


/* =====================================================
   CHARGER LES PRODUITS
===================================================== */

async function loadProducts() {

  if (!currentUser) {
    return;
  }


  productsGrid.innerHTML =
    '<div class="empty-state">' +
    '<div class="empty-icon">⏳</div>' +
    '<p>Chargement des produits...</p>' +
    '</div>';


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
      '<div class="empty-state">' +
      '<div class="empty-icon">⚠️</div>' +
      '<p>Impossible de charger les produits.</p>' +
      '</div>';

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    productsGrid.innerHTML =
      "";

    emptyProducts.classList.remove(
      "hidden"
    );

    return;
  }


  emptyProducts.classList.add(
    "hidden"
  );

  productsGrid.innerHTML =
    "";


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
          ).toFixed(2) +
          " €"
        : "Prix non défini";


    const card =
      document.createElement(
        "article"
      );

    card.className =
      "product-card";


    let imageHtml =
      "";


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

      '<div class="product-card-actions">' +

      '<button class="primary-button">' +
      "Ouvrir" +
      "</button>" +

      '<button class="secondary-button edit-product-button" type="button">' +
      "✏️ Modifier" +
      "</button>" +

      "</div>" +

      "</div>";


    card
      .querySelector(
        ".primary-button"
      )
      .addEventListener(
        "click",
        function () {

          openProductDetail(
            product
          );

        }
      );


    card
      .querySelector(
        ".edit-product-button"
      )
      .addEventListener(
        "click",
        function () {

          openProductModal(
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

  aiEditorPanel.classList.add(
    "hidden"
  );

  detailContent.innerHTML =
    '<div class="empty-state">' +
    '<div class="empty-icon">⏳</div>' +
    '<p>Chargement...</p>' +
    '</div>';


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
        ).toFixed(2) +
        " €"
      : "Prix non défini";


  let imageHtml =
    "";


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


  await prepareAiPreview(
    imageUrl
  );

  await loadGenerationHistory();

}


/* =====================================================
   APERÇU IA DU PRODUIT
===================================================== */

async function prepareAiPreview(
  imageUrl
) {

  if (!aiGenerationPreview) {
    return;
  }

  if (!imageUrl) {

    aiGenerationPreview.innerHTML =
      "<span>📦</span>" +
      "<p>Photo indisponible</p>";

    return;
  }

  aiGenerationPreview.innerHTML =
    '<img src="' +
    imageUrl +
    '" alt="Produit source">';

}


/* =====================================================
   OUVRIR ÉDITEUR IA
===================================================== */

const generationLabels = {

  mockup: {

    title:
      "🖼️ Version Mockup",

    subtitle:
      "Présente ton produit comme dans un catalogue professionnel."

  },

  promotion: {

    title:
      "📣 Fiche promotionnelle",

    subtitle:
      "Prépare un visuel publicitaire clair et attractif."

  },

  vente: {

    title:
      "🛍️ Image de vente",

    subtitle:
      "Crée le visuel principal destiné à donner envie d’acheter."

  },

  decor: {

    title:
      "🏡 Exemple dans un décor",

    subtitle:
      "Montre le produit personnalisé dans une scène réaliste."

  }

};


function openAiEditor(
  type
) {

  if (!currentProduct) {

    generationMessage.textContent =
      "Aucun produit sélectionné.";

    return;
  }


  const label =
    generationLabels[type];


  if (!label) {
    return;
  }


  selectedGenerationType =
    type;


  aiEditorTitle.textContent =
    label.title;

  aiEditorSubtitle.textContent =
    label.subtitle;


  aiInstructions.value =
    "";


  aiStyle.value =
    "professionnel";


  aiFormat.value =
    "carre";


  aiEditorPanel.classList.remove(
    "hidden"
  );


  aiEditorPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =====================================================
   BOUTONS DES 4 OUTILS
===================================================== */

document
  .querySelectorAll(
    ".tool-button[data-generation]"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          openAiEditor(
            button.dataset.generation
          );

        }
      );

    }
  );

/* =====================================================
   APERÇU PERSONNALISATION
===================================================== */

let personalizationImageUrl = null;


function updatePersonalizationPreview() {

  if (!personalizationPreview) {
    return;
  }

  if (!personalizationImageUrl) {

    personalizationPreview.innerHTML =
      "<span>📷</span>" +
      "<p>Photo du produit indisponible</p>";

    return;
  }

  const text =
    personalizationText?.value.trim() || "";

 const color =
  personalizationColor?.value || "#E6C2BF";

const gradient =
  personalizationColor?.dataset.gradient || "";

const font =
  personalizationFont?.value || "Arial";


  personalizationPreview.innerHTML =
    '<div class="personalization-image-wrap">' +

    '<img ' +
    'src="' +
    personalizationImageUrl +
    '" ' +
    'alt="Aperçu du produit" ' +
    'class="personalization-product-image">' +

    '<span ' +
    'class="personalization-text-overlay" ' +
    'style="' +
(
  gradient
    ? 'color:transparent;background-image:linear-gradient(135deg,' +
      gradient +
      ');background-clip:text;-webkit-background-clip:text;'
    : 'color:' + color + ';'
) +
'font-family:' +
font +
';">' +
    escapeHtml(text) +
    '</span>' +

    '</div>';

}


async function openPersonalizationPreview() {

  if (!currentProduct) {

    generationMessage.textContent =
      "Aucun produit sélectionné.";

    return;
  }

  personalizationPanel.classList.remove(
    "hidden"
  );

  personalizationText.value =
    "";

  personalizationColor.value =
    "#d98fa6";

  personalizationFont.value =
    "Arial";

  personalizationImageUrl =
    await getSignedImageUrl(
      currentProduct.photo_url
    );

  updatePersonalizationPreview();

  personalizationPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


function closePersonalizationPreview() {

  personalizationPanel.classList.add(
    "hidden"
  );

  personalizationImageUrl =
    null;

}


if (openPersonalizationButton) {

  openPersonalizationButton.addEventListener(
    "click",
    openPersonalizationPreview
  );

}


if (closePersonalization) {

  closePersonalization.addEventListener(
    "click",
    closePersonalizationPreview
  );

}


if (personalizationText) {

  personalizationText.addEventListener(
    "input",
    updatePersonalizationPreview
  );

}


if (personalizationColor) {

  personalizationColor.addEventListener(
    "input",
    updatePersonalizationPreview
  );

}


if (personalizationFont) {

  personalizationFont.addEventListener(
    "change",
    updatePersonalizationPreview
  );

}

/* =====================================================
   PALETTE DE COULEURS
===================================================== */

document
  .querySelectorAll(".color-swatch")
  .forEach(function (swatch) {

    swatch.addEventListener(
      "click",
      function () {

        document
          .querySelectorAll(".color-swatch")
          .forEach(function (item) {

            item.classList.remove(
              "selected"
            );

          });

        swatch.classList.add(
          "selected"
        );

        if (swatch.dataset.gradient) {

          const colors =
            swatch.dataset.gradient.split(",");

          personalizationColor.value =
            colors[0];

          personalizationColor.dataset.gradient =
            swatch.dataset.gradient;

        } else {

          personalizationColor.value =
            swatch.dataset.color;

          personalizationColor.dataset.gradient =
            "";

        }

        updatePersonalizationPreview();

      }
    );

  });


/* =====================================================
   FERMER ÉDITEUR IA
===================================================== */

function closeAiEditorPanel() {

  aiEditorPanel.classList.add(
    "hidden"
  );

  selectedGenerationType =
    null;

  generationMessage.textContent =
    "";
}


closeAiEditor.addEventListener(
  "click",
  closeAiEditorPanel
);


closeAiEditorBottom.addEventListener(
  "click",
  closeAiEditorPanel
);


/* =====================================================
   CONSTRUCTION DU PROMPT
===================================================== */

function buildGenerationPrompt() {

  if (!currentProduct) {
    return "";
  }


  const type =
    generationLabels[
      selectedGenerationType
    ];


  const styleText =
    aiStyle.options[
      aiStyle.selectedIndex
    ]?.text ||
    "";


  const formatText =
    aiFormat.options[
      aiFormat.selectedIndex
    ]?.text ||
    "";


  const customInstructions =
    aiInstructions.value.trim();


  let prompt =
    "Utilise impérativement la photo du produit fournie " +
    "comme image de référence principale. ";


  prompt +=
    "Conserve exactement le produit présenté sur la photo, " +
    "sa forme, ses proportions, ses couleurs, son motif, " +
    "son texte, son logo et ses détails. ";


  prompt +=
    "Ne remplace pas le produit par un produit similaire " +
    "et ne réinvente pas le produit. ";


  prompt +=
    "Modifie uniquement la présentation, la mise en scène, " +
    "le décor, l'éclairage et l'ambiance selon les consignes. ";


  prompt +=
    "Produit : " +
    currentProduct.name +
    ". ";


  prompt +=
    "Type de visuel : " +
    (type?.title || "") +
    ". ";


  prompt +=
    "Style : " +
    styleText +
    ". ";


  prompt +=
    "Format : " +
    formatText +
    ". ";


  if (
    currentProduct.description
  ) {

    prompt +=
      "Description du produit : " +
      currentProduct.description +
      ". ";

  }


  if (
    customInstructions
  ) {

    prompt +=
      "Consignes supplémentaires : " +
      customInstructions;

  }


  return prompt;
}



/* =====================================================
   IMAGE DE RÉFÉRENCE DU PRODUIT
===================================================== */

async function getProductReferenceImageData() {

  if (!currentProduct?.photo_url) {

    throw new Error(
      "La photo du produit est indisponible."
    );

  }


  const imageUrl =
    await getSignedImageUrl(
      currentProduct.photo_url
    );


  if (!imageUrl) {

    throw new Error(
      "Impossible d'accéder à la photo du produit."
    );

  }


  const image =
    await new Promise(
      function (
        resolve,
        reject
      ) {

        const img =
          new Image();


        /*
         * Autorise le navigateur à utiliser
         * l'image distante dans le canvas.
         */
        img.crossOrigin =
          "anonymous";


        img.onload =
          function () {

            resolve(img);

          };


        img.onerror =
          function () {

            reject(
              new Error(
                "Impossible de charger la photo du produit."
              )
            );

          };


        img.src =
          imageUrl;

      }
    );


  /* =================================================
     REDIMENSIONNEMENT
     Cloudflare demande une image de référence
     inférieure à 512 × 512 pixels.
  ================================================== */

  const maxSize =
    512;


  const largestSide =
    Math.max(
      image.naturalWidth,
      image.naturalHeight
    );


  const scale =
    Math.min(
      1,
      maxSize / largestSide
    );


  const width =
    Math.max(
      1,
      Math.round(
        image.naturalWidth * scale
      )
    );


  const height =
    Math.max(
      1,
      Math.round(
        image.naturalHeight * scale
      )
    );


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    width;

  canvas.height =
    height;


  const context =
    canvas.getContext(
      "2d"
    );


  if (!context) {

    throw new Error(
      "Impossible de préparer la photo du produit."
    );

  }


  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );


  return canvas.toDataURL(
    "image/jpeg",
    0.9
  );

}


/* =====================================================
   GÉNÉRATION DU VISUEL IA
===================================================== */

prepareAiGeneration.addEventListener(
  "click",
  async function () {

    if (!currentProduct) {

      generationMessage.textContent =
        "Aucun produit sélectionné.";

      return;
    }


    if (!currentUser) {

      generationMessage.textContent =
        "Ta session a expiré. Reconnecte-toi.";

      return;
    }


    if (!selectedGenerationType) {

      generationMessage.textContent =
        "Choisis d'abord un type de visuel.";

      return;
    }


    const prompt =
      buildGenerationPrompt();


    prepareAiGeneration.disabled =
      true;


    prepareAiGeneration.textContent =
      "✨ Génération en cours...";


    generationMessage.textContent =
      "Création de ton visuel IA...";


    let generationId =
      null;


    try {

      /* =========================
         1. ENREGISTRER LA DEMANDE
      ========================== */

      const {
        data: generation,
        error: insertError
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
              selectedGenerationType,

            prompt:
              prompt,

            result_url:
              null

          })
          .select()
          .single();


      if (insertError) {

        throw insertError;

      }


      generationId =
        generation.id;


      /* =========================
         2. PRÉPARER LA PHOTO
      ========================== */

      generationMessage.textContent =
        "📷 Préparation de la photo du produit...";


      const imageData =
        await getProductReferenceImageData();


      /* =========================
         3. APPELER L'IA
      ========================== */

      generationMessage.textContent =
        "✨ L'IA prépare ton visuel à partir de ton produit...";


      const {
        data: aiData,
        error: aiError
      } =
        await supabaseClient
          .functions
          .invoke(
            "clever-processor",
            {

              body: {

                prompt:
                  prompt,

                image_data:
                  imageData

              }

            }
          );


      if (aiError) {

        console.error(
          "Erreur Edge Function :",
          aiError
        );


        let details =
          "";


        try {

          if (
            aiError.context
          ) {

            const errorBody =
              await aiError.context.json();


            details =
              errorBody?.error ||
              "";

          }

        } catch (_) {

          // Rien à faire si le détail n'est pas lisible

        }


        throw new Error(
          details ||
          aiError.message ||
          "Impossible de contacter le moteur IA."
        );

      }


      if (
        !aiData ||
        !aiData.success ||
        !aiData.image
      ) {

        throw new Error(
          aiData?.error ||
          "L'IA n'a pas retourné d'image."
        );

      }


      /* =========================
         4. ENREGISTRER LE VISUEL
      ========================== */

      generationMessage.textContent =
        "Visuel généré ✨";


      const {
        error: updateError
      } =
        await supabaseClient
          .from(
            "design_generations"
          )
          .update({

            result_url:
              aiData.image

          })
          .eq(
            "id",
            generationId
          )
          .eq(
            "user_id",
            currentUser.id
          );


      if (updateError) {

        throw updateError;

      }


      /* =========================
         5. AFFICHER LE VISUEL
      ========================== */

      aiGenerationPreview.innerHTML =
        '<img src="' +
        aiData.image +
        '" alt="Visuel généré par IA">';


      await loadGenerationHistory();


      generationMessage.textContent =
        "Ton visuel est prêt ✨";


      aiInstructions.value =
        "";


    } catch (error) {

      console.error(
        "Erreur génération IA :",
        error
      );


      generationMessage.textContent =
        error?.message ||
        "Impossible de générer le visuel.";


      /* =========================
         SUPPRIMER LA DEMANDE
         SI LA GÉNÉRATION ÉCHOUE
      ========================== */

      if (generationId) {

        await supabaseClient
          .from(
            "design_generations"
          )
          .delete()
          .eq(
            "id",
            generationId
          )
          .eq(
            "user_id",
            currentUser.id
          );


        await loadGenerationHistory();

      }

    } finally {

      prepareAiGeneration.disabled =
        false;


      prepareAiGeneration.textContent =
        "✨ Préparer le visuel";

    }

  }
);

/* =====================================================
   HISTORIQUE DES GÉNÉRATIONS
===================================================== */

async function loadGenerationHistory() {

  if (
    !currentProduct ||
    !currentUser
  ) {

    return;
  }


  generationHistory.innerHTML =
    '<div class="history-empty">' +
    'Chargement de l’historique...' +
    '</div>';


  const {
    data,
    error
  } =
    await supabaseClient
      .from(
        "design_generations"
      )
      .select("*")
      .eq(
        "product_id",
        currentProduct.id
      )
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
      "Erreur historique :",
      error
    );

    generationHistory.innerHTML =
      '<div class="history-empty">' +
      'Impossible de charger l’historique.' +
      '</div>';

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    generationHistory.innerHTML =
      '<div class="history-empty">' +
      'Aucune demande pour le moment.' +
      '</div>';

    return;
  }


  generationHistory.innerHTML =
    "";


  data.forEach(
    function (generation) {

      const type =
        generationLabels[
          generation.generation_type
        ];


      const title =
        type?.title ||
        generation.generation_type ||
        "Visuel";


      const date =
        generation.created_at
          ? new Date(
              generation.created_at
            ).toLocaleString(
              "fr-FR"
            )
          : "";


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "history-item";


      /* =================================================
         CONTENU DE L'HISTORIQUE
      ================================================= */

      let preview = "";


      if (
        generation.result_url
      ) {

        preview =
          '<img ' +
          'src="' +
          generation.result_url +
          '" ' +
          'alt="Visuel généré" ' +
          'class="history-preview-image">';

      } else {

        preview =
          '<div class="history-preview-empty">' +
          '⏳' +
          '</div>';

      }


      item.innerHTML =

        '<div class="history-preview">' +

        preview +

        '</div>' +

        '<div class="history-item-info">' +

        '<strong>' +
        escapeHtml(
          title
        ) +
        '</strong>' +

        '<small>' +
        escapeHtml(
          date
        ) +
        '</small>' +

        '</div>' +

        '<span class="history-status">' +

        (
          generation.result_url
            ? "Disponible"
            : "En attente"
        ) +

        '</span>';


      /* =================================================
         OUVRIR LE VISUEL AU CLIC
      ================================================= */

      if (
        generation.result_url
      ) {

        item.style.cursor =
          "pointer";


        item.addEventListener(
          "click",
          function () {

            aiGenerationPreview.innerHTML =

              '<img ' +
              'src="' +
              generation.result_url +
              '" ' +
              'alt="Visuel généré par IA">';


            generationMessage.textContent =
              "Visuel chargé depuis l’historique ✨";

          }
        );

      }


      generationHistory.appendChild(
        item
      );

    }
  );

}


/* =====================================================
   FERMER DÉTAIL
===================================================== */

function closeDetailProductModal() {

  detailModal.classList.add(
    "hidden"
  );

  currentProduct =
    null;

  selectedGenerationType =
    null;

  aiEditorPanel.classList.add(
    "hidden"
  );

}


closeDetailModal.addEventListener(
  "click",
  closeDetailProductModal
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

      closeDetailProductModal();

    }

  }
);


/* =====================================================
   SESSION SUPABASE
===================================================== */

supabaseClient.auth.onAuthStateChange(
  function (
    event,
    session
  ) {

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

      currentUser =
        null;

      showAuth();

    }

  }
);


/* =====================================================
   DÉMARRAGE
===================================================== */

checkSession();
