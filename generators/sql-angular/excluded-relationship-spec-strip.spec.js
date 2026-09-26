import { describe, expect, it } from 'vitest';

import { stripExcludedFromFormServiceSpec, stripExcludedFromUpdateSpec } from './excluded-relationship-spec-strip.js';

// The shape upstream's _entityFile_-update.spec.ts.ejs writes (taken from the generated TajOrganization spec, where
// hiredContractors -> Contractor is excluded from the form by @customQueryAnnotation and the component no longer has
// contractorsSharedCollection / compareContractor - which made the spec fail to compile).
const UPDATE_SPEC = `import { IContractor } from 'app/entities/psqlblog/contractor/contractor.model';
import { ContractorService } from 'app/entities/psqlblog/contractor/service/contractor.service';
import { ITajUser } from 'app/entities/psqlblog/taj-user/taj-user.model';
import { TajUserService } from 'app/entities/psqlblog/taj-user/service/taj-user.service';

describe('TajOrganization Management Update Component', () => {
  let contractorService: ContractorService;
  let tajUserService: TajUserService;

  beforeEach(() => {
    contractorService = TestBed.inject(ContractorService);
    tajUserService = TestBed.inject(TajUserService);
  });

  describe('ngOnInit', () => {
    it('should call Contractor query and add missing value', () => {
      const tajOrganization: ITajOrganization = { id: '87061d20-94fb-444d-b228-1e873ee23691' };
      const hiredContractors: IContractor[] = [{ id: 'fccf11f7-45ef-44e6-9532-2ed5cedcf2ec' }];
      tajOrganization.hiredContractors = hiredContractors;
      vi.spyOn(contractorService, 'query').mockReturnValue(of(new HttpResponse({ body: contractorCollection })));
      expect(contractorService.addContractorToCollectionIfMissing).toHaveBeenCalledWith(
        contractorCollection,
        ...additionalContractors.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.contractorsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call TajUser query and add missing value', () => {
      expect(comp.tajUsersSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const tajOrganization: ITajOrganization = { id: '87061d20-94fb-444d-b228-1e873ee23691' };
      const hiredContractor: IContractor = { id: 'fccf11f7-45ef-44e6-9532-2ed5cedcf2ec' };
      tajOrganization.hiredContractors = [hiredContractor];
      const user: ITajUser = { id: 'a30298cf-223f-4185-9984-7ec30e626f17' };
      tajOrganization.users = [user];

      expect(comp.contractorsSharedCollection()).toContainEqual(hiredContractor);
      expect(comp.tajUsersSharedCollection()).toContainEqual(user);
    });
  });

  describe('Compare relationships', () => {
    describe('compareContractor', () => {
      it('should forward to contractorService', () => {
        vi.spyOn(contractorService, 'compareContractor');
        comp.compareContractor(entity, entity2);
        expect(contractorService.compareContractor).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareTajUser', () => {
      it('should forward to tajUserService', () => {
        comp.compareTajUser(entity, entity2);
      });
    });
  });
});
`;

const HIRED_CONTRACTORS = {
  otherEntityAngularName: 'Contractor',
  otherEntityInstancePlural: 'contractors',
  propertyName: 'hiredContractors',
  relationshipFieldName: 'hiredContractor',
};

describe('stripExcludedFromUpdateSpec', () => {
  const out = stripExcludedFromUpdateSpec(UPDATE_SPEC, { entityInstance: 'tajOrganization', rels: [HIRED_CONTRACTORS] });

  it('leaves no reference to what the component no longer has', () => {
    expect(out).not.toMatch(/contractor/i);
  });

  it('keeps every kept relationship intact', () => {
    expect(out).toContain("import { TajUserService } from 'app/entities/psqlblog/taj-user/service/taj-user.service';");
    expect(out).toContain('tajUserService = TestBed.inject(TajUserService);');
    expect(out).toContain("it('should call TajUser query and add missing value', () => {");
    expect(out).toContain('tajOrganization.users = [user];');
    expect(out).toContain('expect(comp.tajUsersSharedCollection()).toContainEqual(user);');
    expect(out).toContain("describe('compareTajUser', () => {");
  });

  it('keeps the brackets balanced', () => {
    const count = ch => out.split(ch).length - 1;
    expect(count('(')).toBe(count(')'));
    expect(count('{')).toBe(count('}'));
    expect(count('[')).toBe(count(']'));
  });

  it('is a no-op with nothing excluded', () => {
    expect(stripExcludedFromUpdateSpec(UPDATE_SPEC, { entityInstance: 'tajOrganization', rels: [] })).toBe(UPDATE_SPEC);
  });
});

describe('stripExcludedFromFormServiceSpec', () => {
  const FORM_SPEC = `        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            customers: expect.any(Object),
            hiredContractors: expect.any(Object),
            users: expect.any(Object),
          }),
        );
`;

  it('drops the excluded form controls and nothing else', () => {
    const out = stripExcludedFromFormServiceSpec(FORM_SPEC, ['hiredContractors', 'customers']);
    expect(out).not.toMatch(/hiredContractors|customers/);
    expect(out).toContain('id: expect.any(Object),');
    expect(out).toContain('users: expect.any(Object),');
  });
});
