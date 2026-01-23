import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./ConditionsDelivrance.css";

export default function ConditionsDelivrance() {
  const location = useLocation();
  const isInDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="cgv-page">
      <h1 className="cgv-title">CONDITIONS GÉNÉRALES DE VENTE (CGV)</h1>

      <h2 className="cgv-subtitle">
        Service de Délivrance des Certificats d’Origine
        <br />
        Chambre de Commerce de Djibouti (CCD)
      </h2>

      {!isInDashboard && (
        <div className="back-to-login-container">
          <Link to="/login">Revenir à la page de connexion</Link>
        </div>
      )}

      <p>
        Les présentes Conditions Générales de Vente (CGV) encadrent la fourniture
        du service de délivrance des Certificats d’Origine (C.O.) par la Chambre
        de Commerce de Djibouti (CCD).
      </p>

      <p>
        Elles déterminent les droits, obligations et responsabilités applicables
        à tout utilisateur sollicitant une prestation liée à l’émission, la
        validation ou la légalisation d’un C.O., que ce soit via la plateforme
        électronique ou par procédure physique.
      </p>

      <p className="cgv-highlight">
        En sollicitant ce service, le demandeur reconnaît avoir pris connaissance
        et accepté sans réserve les présentes CGV.
      </p>

      <h3>1. OBJET DU SERVICE ET DÉFINITIONS</h3>

      <h4>1.1 Objet</h4>
      <p>
        La prestation couvre l’examen, la vérification, la validation et la
        délivrance des certificats d’origine nécessaires à l’exportation.
      </p>

      <h4>1.2 Définition du Certificat d’Origine</h4>
      <p>
        Le Certificat d’Origine (C.O.) est un document officiel attestant le pays
        d’origine des marchandises exportées, réexportées ou en transit à partir
        de Djibouti. Il peut être requis par les autorités douanières, les
        banques, les acheteurs ou les partenaires commerciaux.
      </p>

      <h4>1.3 Types de Certificats</h4>
      <ul>
        <li>
          Certificat d’Origine non-préférentiel : délivré directement par la CCD.
        </li>
        <li>
          Certificat d’Origine préférentiel : visé ou légalisé par la CCD dans le
          cadre d’un accord commercial.
        </li>
      </ul>

      <h3>2. CHAMP D’APPLICATION</h3>
      <p>
        Les présentes CGV s’appliquent à toute demande de délivrance ou de
        légalisation de C.O., soumise via la plateforme électronique ou
        physiquement au guichet de la CCD. Elles prévalent sur toute clause
        contraire du demandeur.
      </p>

      <h3>3. MODALITÉS DE DEMANDE ET RESPONSABILITÉS</h3>

      <h4>3.1 Responsabilité du Demandeur</h4>
      <p>
        L’entreprise est responsable de l’exactitude, de la complétude et de la
        véracité des informations fournies. Toute omission ou fausse déclaration
        relève de sa seule responsabilité.
      </p>

      <h4>3.2 Responsabilité de la CCD</h4>
      <p>
        La CCD vérifie la conformité réglementaire et délivre un C.O. authentique
        et sécurisé. Elle n’est pas responsable des conséquences douanières ou
        réglementaires dans le pays de destination.
      </p>

      <h3>4. TARIFICATION, FRAIS ET CONDITIONS DE PAIEMENT</h3>

      <h4>4.1 Tarifs</h4>
      <p>Les tarifs de délivrance ou de légalisation sont publics, affichés et révisables.</p>

      <h4>4.2 Prise en charge</h4>
      <p>Les frais sont à la charge de l’entreprise demandeuse.</p>

      <h4>4.3 Paiement</h4>
      <p>Le certificat est délivré uniquement après paiement complet des frais.</p>

      <h3>5. DÉLAI DE TRAITEMENT ET DÉLIVRANCE</h3>
      <p>
        Le délai indicatif est de 48 heures ouvrables, sous réserve que le dossier
        soit complet. Le C.O. est délivré en format électronique sécurisé.
      </p>

      <h3>6. RÉCLAMATIONS, ERREURS ET NON-CONFORMITÉS</h3>

      <p>
        Aucune réémission gratuite d’un C.O validé ne peut être demandée lorsque
        l’erreur provient de données fournies par le demandeur.
      </p>

      <p>
        En cas d’erreur matérielle imputable à la CCD, la CCD procède à la
        rectification sans frais. Toute réclamation doit être faite dans un délai
        de 8 jours ouvrables.
      </p>

      <h3>7. SUSPENSION DU SERVICE ET REFUS</h3>
      <p>
        La CCD peut refuser ou suspendre la délivrance en cas de fraude, suspicion
        de falsification, documents incomplets ou non-paiement.
      </p>

      <h3>8. LIMITATION DE RESPONSABILITÉ</h3>
      <p>
        La CCD ne peut être tenue responsable des conséquences financières,
        douanières ou commerciales résultant de l’usage du C.O. délivré.
      </p>

      <h3>9. FORCE MAJEURE</h3>
      <p>
        Toute obligation est suspendue en cas de force majeure (catastrophe,
        grève, panne majeure, cyberattaque).
      </p>

      <h3>10. CONFIDENTIALITÉ ET DONNÉES PERSONNELLES</h3>
      <p>
        La CCD garantit la confidentialité des informations fournies et leur usage
        strictement limité à la délivrance des C.O. Les données sont protégées
        selon la législation en vigueur.
      </p>

      <h3>11. PROPRIÉTÉ INTELLECTUELLE</h3>
      <p>
        Les modèles, formulaires, contenus et systèmes liés au service restent la
        propriété exclusive de la CCD.
      </p>

      <h3>12. DROIT APPLICABLE ET JURIDICTION</h3>
      <p>
        Les présentes CGV sont régies par le droit djiboutien. Tout litige relève
        de la juridiction administrative de Djibouti après tentative de règlement
        amiable.
      </p>

      <h3>13. ACCEPTATION FINALE</h3>
      <p>
        La validation d’une demande via la plateforme ou au guichet vaut
        acceptation pleine et irrévocable des présentes CGV. Le demandeur
        reconnaît sa responsabilité quant à l’exactitude des informations
        transmises.
      </p>
    </div>
  );
}
