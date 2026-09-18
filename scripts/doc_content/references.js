const {
  p,
  chapterHeading,
  sectionHeading
} = require("./helpers");

function createReferences() {
  const elements = [];

  // REFERENCES HEADING
  elements.push(...chapterHeading("REFERENCES", true));

  const referenceList = [
    "[1] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin, \"Attention is all you need,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 30, pp. 5998–6008, 2017.",
    "[2] T. Brown, B. Mann, N. Ryder, M. Subbiah, J. D. Kaplan, P. Dhariwal, A. Neelakantan, et al., \"Language models are few-shot learners,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 1877–1901, 2020.",
    "[3] H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.-A. Lachaux, T. Lacroix, B. Rozière, et al., \"LLaMA: Open and efficient foundation language models,\" arXiv preprint arXiv:2302.13971, 2023.",
    "[4] Meta AI, \"The Llama 3 herd of models,\" Meta Research Technical Report, arXiv preprint arXiv:2407.21783, 2024.",
    "[5] R. Rombach, A. Blattmann, D. Lorenz, P. Esser, and B. Ommer, \"High-resolution image synthesis with latent diffusion models,\" in Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pp. 10684–10695, 2022.",
    "[6] Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nicklas, and M. Le, \"Flow matching for generative modeling,\" in International Conference on Learning Representations (ICLR), 2023.",
    "[7] P. Esser, S. Kulal, A. Blattmann, R. Entezari, J. Müller, H. Saini, Y. Levi, et al., \"Scaling rectified flow transformers for high-resolution image synthesis,\" arXiv preprint arXiv:2403.03206, 2024.",
    "[8] P. O'Donovan, A. Agarwala, and A. Hertzmann, \"Learning layouts and colors for graphic design,\" in Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI), pp. 987–996, 2014.",
    "[9] X. Zheng, X. Tao, Z. Lin, X. Shen, and F. Li, \"Content-aware generative modeling of graphic design layouts,\" ACM Transactions on Graphics (TOG), vol. 38, no. 4, pp. 1–12, 2019.",
    "[10] E. Horvitz, \"Principles of mixed-initiative user interfaces,\" in Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI), pp. 159–166, 1999.",
    "[11] P. Lewis, E. Perez, A. Piktus, F. Petroni, V. Karpukhin, N. Goyal, H. Küttler, et al., \"Retrieval-augmented generation for knowledge-intensive NLP tasks,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 9459–9474, 2020.",
    "[12] L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. L. Wainwright, P. Mishkin, C. Zhang, et al., \"Training language models to follow instructions with human feedback,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 35, pp. 27730–27744, 2022.",
    "[13] R. Rafailov, A. Sharma, E. Mitchell, S. Ermon, C. D. Manning, and C. Finn, \"Direct preference optimization: Your language model is secretly a reward model,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 36, 2023.",
    "[14] B. T. Willard and R. Louf, \"Efficient guided generation for large language models,\" arXiv preprint arXiv:2307.09702, 2023.",
    "[15] World Wide Web Consortium (W3C), \"Web Content Accessibility Guidelines (WCAG) 2.1,\" W3C Recommendation, Jun. 2018. [Online]. Available: https://www.w3.org/TR/WCAG21/",
    "[16] Vercel Inc., \"Next.js 15 Documentation: The React Framework for the Web,\" 2024. [Online]. Available: https://nextjs.org/docs",
    "[17] Microsoft Corporation, \"TypeScript Language Specification,\" Microsoft Open Source, 2024. [Online]. Available: https://www.typescriptlang.org/",
    "[18] Groq Inc., \"Groq LPU Inference Engine Architecture: Deterministic Tensor Streaming,\" Whitepaper, 2024. [Online]. Available: https://groq.com/",
    "[19] NVIDIA Corporation, \"NVIDIA Build Cloud APIs: Accelerated Generative Inference Infrastructure,\" 2024. [Online]. Available: https://build.nvidia.com/",
    "[20] Google LLC, \"Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context,\" Google DeepMind Technical Report, 2024.",
    "[21] B. Gitana, \"PptxGenJS: JavaScript PowerPoint Presentation Generation Library,\" Open Source Software, 2024. [Online]. Available: https://gitbrent.github.io/PptxGenJS/",
    "[22] Supabase Inc., \"Supabase Architecture: The Open Source Firebase Alternative on PostgreSQL,\" 2024. [Online]. Available: https://supabase.com/docs",
    "[23] Tailwind Labs Inc., \"Tailwind CSS: A utility-first CSS framework for rapid UI development,\" 2024. [Online]. Available: https://tailwindcss.com/",
    "[24] Radix UI, \"Radix Primitives: Unstyled, accessible components for building high-quality design systems,\" WorkOS, 2024. [Online]. Available: https://www.radix-ui.com/",
    "[25] C. Collingridge, \"Zod: TypeScript-first schema validation with static type inference,\" 2024. [Online]. Available: https://zod.dev/",
  ];

  referenceList.forEach((ref) => {
    elements.push(p(ref, { spaceBefore: 60, spaceAfter: 180 }));
  });

  return elements;
}

module.exports = { createReferences };
