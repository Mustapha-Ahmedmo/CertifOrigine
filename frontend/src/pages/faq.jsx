import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./faq.css";

export default function Faq() {
  const faqItems = useMemo(
    () => [
      {
        q: "1. À qui s’adresse le service de délivrance du C.O. en ligne ?",
        a: "Le service s’adresse à toutes les entreprises exportatrices, aux transitaires, aux agences logistiques, etc., installés à Djibouti et souhaitant obtenir un certificat d’origine pour l’exportation de leurs marchandises, la réexportation ou le transit de marchandises pour le compte d’un client.",
      },
      {
        q: "2. Qu’est-ce qu’un Certificat d’Origine (C.O.) ?",
        a: "Le Certificat d’Origine est un document officiel attestant que les marchandises exportées, réexportées ou en transit à partir de Djibouti sont originaires d’un pays donné. Il est généralement exigé par les douanes du pays importateur, les clients, les banques et les autorités de contrôle.",
      },
      {
        q: "3. À quoi sert le Certificat d’Origine ?",
        a: "Il permet de faciliter les échanges commerciaux, de répondre aux exigences réglementaires du pays de destination, de bénéficier de préférences tarifaires et prouver l’origine des produits en cas de contrôle.",
      },
      {
        q: "4. Quels types de Certificats d’Origine sont délivrés ?",
        a: "La CCD délivre essentiellement les C.O non préférentiels. En outre, elle légalise à la demande du client les certificats d’origine préférentiels.",
      },
      {
        q: "5. Quelles sont les pièces justificatives requises ?",
        a: "Les documents justificatifs requis sont en relation avec la demande du client. Ci-après quelques exemples de documents justificatifs : le connaissement (bill of loading), lettre de transport aérien (airway bill), certificat sanitaire, agrément d’exploitation, patente industrie, etc.",
      },
      {
        q: "6. Quelles sont les procédures de délivrance d’un C.O. en ligne ?",
        a: [
          "Créer un compte ou se connecter.",
          "Soumettre une demande en ligne en remplissant dûment le formulaire.",
          "Joindre les pièces justificatives.",
          "Attendre la validation de la CCD de votre demande.",
          "Régler les frais.",
          "Attendre la réception du C.O électronique visé.",
          "Téléchargement et imprimer le C.O. électronique.",
        ],
        isList: true,
      },
      {
        q: "7. Délais de délivrance",
        a: "Les demandes sont généralement traitées immédiatement pour les entreprises vérifiées, ou sous 24h selon la complexité.",
      },
      { q: "8. Frais de délivrance", a: "Les frais varient selon la demande. Ils sont affichés sur la plateforme." },
      { q: "9. Que faire en cas de problèmes techniques ?", a: "Vérifier la connexion, essayer un autre navigateur ou réduire la taille des documents. En cas de persistance : support@ccd.dj / +253 21351070." },
      { q: "10. À qui m’adresser pour des questions administratives ?", a: "Service Délivrance C.O. – Chambre de Commerce.\nEmail : support@ccd.dj\nTéléphone : (+253) 21351070" },
      { q: "11. Comment suivre ma demande ?", a: "A chaque modification du statut de votre demande, vous réserverez une notification de la part de la CCD." },
      { q: "12. Validité internationale du C.O.", a: "Le C.O. est valable internationalement mais certains pays exigent des formats spécifiques. Vérifiez toujours les exigences du pays importateur." },
      { q: "13. Modification d’une demande", a: "Une modification est possible tant que la demande n’a pas été validée. Après validation, une nouvelle demande est requise." },
      { q: "14. Sécurisation du certificat d’origine en ligne", a: "Le document inclut un QR code de vérification, une signature électronique et un numéro unique garantissant son authenticité." },
    ],
    []
  );

  const location = useLocation();
  const isInDashboard = location.pathname.startsWith("/dashboard");

  const [openIndex, setOpenIndex] = useState(0);
  const toggle = (idx) => setOpenIndex((prev) => (prev === idx ? -1 : idx));

  return (
    <div className="faq-page">
      <div className="faq-hero">
        <h1 className="faq-title">FAQ – Service de Délivrance en Ligne du Certificat d’Origine</h1>
        <p className="faq-subtitle">Retrouvez ici les réponses aux questions les plus fréquentes.</p>
      </div>

      <div className="faq-list">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
              <button type="button" className="faq-question" onClick={() => toggle(idx)}>
                <span className="faq-q">{item.q}</span>
                <span className={`faq-icon ${isOpen ? "open" : ""}`}>⌄</span>
              </button>

              {isOpen && (
                <div className="faq-answer">
                  {item.isList ? (
                    <ol className="faq-ol">
                      {item.a.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    item.a.split("\n").map((line, i) => (
                      <p key={i} className="faq-p">
                        {line}
                      </p>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isInDashboard && (
        <div className="back-to-login-container">
          <Link to="/login">Revenir à la page de connexion</Link>
        </div>
      )}
    </div>
  );
}
